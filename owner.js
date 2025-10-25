let web3, provider, account, sale, usdt, kjc;

const $ = (id) => document.getElementById(id);
function toast(msg, type="info"){
  const t = $("toast");
  t.style.display = "block";
  t.textContent = msg;
  t.style.borderColor = type==="ok" ? "#225b2a" : type==="err" ? "#5b2222" : "#1b1c25";
  setTimeout(()=>t.style.display="none", 3500);
}
const toWei = (n, d=18)=> web3.utils.toBN(web3.utils.toWei(String(n), "ether")); // เราใช้เหรียญ 18 ทศนิยม

// ---------------- connect ----------------
async function connect() {
  try{
    provider = window.ethereum || window.bitget?.ethereum || window.okxwallet?.ethereum || window.bitkeep?.ethereum;
    if(!provider) return toast("ไม่พบกระเป๋า (MetaMask/Bitget/OKX)", "err");

    await provider.request({ method: "eth_requestAccounts" });
    web3 = new Web3(provider);
    const ch = await provider.request({ method:"eth_chainId" });
    if (ch !== window.NETWORK.chainIdHex) {
      await provider.request({ method:"wallet_switchEthereumChain", params:[{ chainId: window.NETWORK.chainIdHex }]});
    }

    const accs = await web3.eth.getAccounts();
    account = accs[0];

    sale = new web3.eth.Contract(window.SALE_ABI, window.ADDR.CONTRACT);
    usdt = new web3.eth.Contract(window.ERC20_MINI_ABI, window.ADDR.USDT);
    kjc  = new web3.eth.Contract(window.ERC20_MINI_ABI, window.ADDR.KJC);

    $("wallet").textContent = `✅ ${account.slice(0,6)}...${account.slice(-4)}`;
    $("ca").textContent = window.ADDR.CONTRACT;

    await refresh();

    provider.on?.("accountsChanged", ()=>location.reload());
    provider.on?.("chainChanged", ()=>location.reload());
  }catch(e){
    console.error(e);
    toast("เชื่อมต่อไม่สำเร็จ: " + (e?.message||e), "err");
  }
}

// ---------------- load balances/params ----------------
async function refresh(){
  try{
    // balances
    const [ub, kb] = await Promise.all([
      usdt.methods.balanceOf(window.ADDR.CONTRACT).call(),
      kjc.methods.balanceOf(window.ADDR.CONTRACT).call()
    ]);
    $("usdtBal").textContent = fmt(ub, window.DECIMALS.USDT) + " USDT";
    $("kjcBal").textContent  = fmt(kb, window.DECIMALS.KJC)  + " KJC";

    // params
    const [apr, ci, ld, rci] = await Promise.all([
      sale.methods.REWARD_APR_BPS().call(),
      sale.methods.CLAIM_INTERVAL_STAKE().call(),
      sale.methods.LOCK_DURATION().call(),
      sale.methods.REF_CLAIM_INTERVAL().call()
    ]);
    $("aprBps").textContent = apr;
    $("claimInt").textContent = ci;
    $("lockDur").textContent = ld;
    $("refInt").textContent = rci;
  }catch(e){
    console.error(e);
    toast("โหลดข้อมูลไม่สำเร็จ", "err");
  }
}

function fmt(v, dec=18){
  try{
    const s = BigInt(v).toString();
    if(dec===0) return s;
    const pad = s.padStart(dec+1,"0");
    const a = pad.slice(0, pad.length-dec);
    let b = pad.slice(pad.length-dec).replace(/0+$/,"");
    return b ? `${a}.${b}` : a;
  }catch{ return String(v); }
}

// ---------------- quick actions ----------------
async function setRefInterval(seconds){
  try{
    // ดึงค่าปัจจุบันที่เหลือ (เพื่อคงค่าเดิม)
    const [apr, ci, ld] = await Promise.all([
      sale.methods.REWARD_APR_BPS().call(),
      sale.methods.CLAIM_INTERVAL_STAKE().call(),
      sale.methods.LOCK_DURATION().call()
    ]);

    // ค่า ref1/2/3 เราไม่อ่านจาก chain ในชุด ABI นี้
    // จึงใช้ค่ามาตรฐานที่คุณ deploy (10%, 6%, 4%) = 1000 / 600 / 400
    const REF1 = 1000, REF2 = 600, REF3 = 400;

    toast("ส่งธุรกรรมปรับ ref claim interval...");
    await sale.methods.setParams(apr, ci, ld, REF1, REF2, REF3, seconds).send({ from: account });
    toast("อัปเดตสำเร็จ ✅","ok");
    await refresh();
  }catch(e){
    console.error(e);
    toast("ปรับไม่สำเร็จ: "+(e?.message||e),"err");
  }
}

// ---------------- withdraw ----------------
async function withdrawUSDT(){
  try{
    const to = $("wTo").value.trim();
    const amt = $("wUSDT").value.trim();
    if(!to || !amt) return toast("กรอกปลายทางและจำนวน USDT", "err");
    await sale.methods.ownerWithdrawUSDT(web3.utils.toWei(amt,"ether"), to).send({ from: account });
    toast("ถอน USDT สำเร็จ","ok");
    await refresh();
  }catch(e){ console.error(e); toast("ถอน USDT ล้มเหลว: "+(e?.message||e),"err"); }
}

async function withdrawKJC(){
  try{
    const to = $("wTo").value.trim();
    const amt = $("wKJC").value.trim();
    if(!to || !amt) return toast("กรอกปลายทางและจำนวน KJC", "err");
    await sale.methods.ownerWithdrawKJC(web3.utils.toWei(amt,"ether"), to).send({ from: account });
    toast("ถอน KJC สำเร็จ","ok");
    await refresh();
  }catch(e){ console.error(e); toast("ถอน KJC ล้มเหลว: "+(e?.message||e),"err"); }
}

// ---------------- airdrop stakes ----------------
async function airdrop(){
  try{
    const users = $("airUsers").value.trim().split(/\n+/).filter(Boolean);
    const amts  = $("airAmounts").value.trim().split(/\n+/).filter(Boolean);
    if(users.length===0 || users.length!==amts.length) return toast("จำนวน address/amount ไม่ตรงกัน", "err");

    const startRaw = $("airStart").value.trim();
    const start = startRaw ? Number(startRaw) : Math.floor(Date.now()/1000);

    const amountsWei = amts.map(a => web3.utils.toWei(a,"ether"));
    toast("ส่งธุรกรรม airdrop stake...");
    await sale.methods.airdropStakes(users, amountsWei, start).send({ from: account });
    toast("Airdrop Stake สำเร็จ ✅","ok");
  }catch(e){ console.error(e); toast("Airdrop ล้มเหลว: "+(e?.message||e),"err"); }
}

// ---------------- init UI ----------------
window.addEventListener("DOMContentLoaded", ()=>{
  $("btnConnect").onclick = connect;
  $("btnRef0").onclick = ()=> setRefInterval(0);
  $("btnRef3").onclick = ()=> setRefInterval(259200);
  $("btnWUSDT").onclick = withdrawUSDT;
  $("btnWKJC").onclick  = withdrawKJC;
  $("btnAirdrop").onclick = airdrop;

  $("ca").textContent = window.ADDR.CONTRACT;
});
