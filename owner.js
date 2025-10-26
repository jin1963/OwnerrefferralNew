let web3, provider, account, contract;

const $ = (id) => document.getElementById(id);
const toast = (msg, type = "info") => {
  const box = $("toast");
  box.textContent = msg;
  box.style.display = "block";
  box.style.borderColor = type === "ok" ? "#225b2a" : type === "err" ? "#5b2222" : "#2a3144";
  clearTimeout(window.__toastT);
  window.__toastT = setTimeout(() => (box.style.display = "none"), 4000);
};

function toWeiDecimal(xStr, decimals = 18) {
  // แปลง "123.45" -> wei (string) ตาม decimals
  const s = String(xStr).trim();
  if (!s) return "0";
  const [i, f = ""] = s.split(".");
  const frac = (f + "0".repeat(decimals)).slice(0, decimals);
  return BigInt(i || "0").toString() + (frac ? frac : "".padStart(decimals, "0"));
}

async function connectWallet() {
  try {
    provider =
      window.ethereum ||
      window.bitkeep?.ethereum ||
      window.okxwallet?.ethereum ||
      window.bitget?.ethereum;

    if (!provider) {
      toast("❌ ไม่พบกระเป๋า (MetaMask/Bitget/OKX) ลองเปิดด้วย browser ที่ติดตั้ง wallet", "err");
      return;
    }

    await provider.request({ method: "eth_requestAccounts" });
    web3 = new Web3(provider);

    // chain check
    const chainId = await provider.request({ method: "eth_chainId" });
    if (chainId !== window.NETWORK.chainIdHex) {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: window.NETWORK.chainIdHex }],
      });
    }

    const accounts = await web3.eth.getAccounts();
    account = accounts[0];

    contract = new web3.eth.Contract(window.SALE_ABI, window.ADDR.CONTRACT);

    $("wallet").textContent = `✅ ${account.slice(0, 6)}...${account.slice(-4)}`;
    $("ca").textContent = window.ADDR.CONTRACT;

    provider.on?.("accountsChanged", () => location.reload());
    provider.on?.("chainChanged", () => location.reload());

    toast("เชื่อมต่อสำเร็จ ✅", "ok");
    await refreshAll();
  } catch (e) {
    console.error(e);
    toast("❌ เชื่อมต่อไม่สำเร็จ: " + (e?.message || e), "err");
  }
}

async function refreshAll() {
  try {
    // paused?
    let paused = "—";
    if (contract.methods.paused) {
      try { paused = await contract.methods.paused().call(); } catch {}
    }
    $("sysState").textContent = (paused === true || paused === "true") ? "⏸️ Paused" : "▶️ Running";

    // owner
    try {
      const owner = await contract.methods.owner().call();
      $("ownerAddr").textContent = owner;
    } catch {
      $("ownerAddr").textContent = "—";
    }

    // read params (ชื่อฟังก์ชันตาม ABI ของคุณ)
    const pull = async (name, id) => {
      try { $(id).textContent = await contract.methods[name]().call(); }
      catch { $(id).textContent = "—"; }
    };
    await Promise.all([
      pull("REWARD_APR_BPS", "aprBps"),
      pull("CLAIM_INTERVAL_STAKE", "claimStakeInt"),
      pull("LOCK_DURATION", "lockDur"),
      pull("REF1_BPS", "ref1"),
      pull("REF2_BPS", "ref2"),
      pull("REF3_BPS", "ref3"),
      pull("REF_CLAIM_INTERVAL", "refClaimInt"),
    ]);
  } catch (e) {
    console.error(e);
    toast("⚠️ อ่านค่าพารามิเตอร์ไม่ได้", "err");
  }
}

async function setParams() {
  if (!account) return toast("กรุณาเชื่อมต่อกระเป๋าก่อน", "err");
  try {
    const aprBps         = $("in_aprBps").value.trim();
    const claimStakeInt  = $("in_claimStakeInt").value.trim();
    const lockDur        = $("in_lockDur").value.trim();
    const ref1           = $("in_ref1").value.trim();
    const ref2           = $("in_ref2").value.trim();
    const ref3           = $("in_ref3").value.trim();
    const refClaimInt    = $("in_refClaimInt").value.trim();

    if ([aprBps, claimStakeInt, lockDur, ref1, ref2, ref3, refClaimInt].some(v => v === "")) {
      return toast("กรอกค่าพารามิเตอร์ให้ครบ", "err");
    }

    toast("⏳ ส่งธุรกรรม setParams...");
    await contract.methods
      .setParams(
        aprBps,             // uint256 bps
        claimStakeInt,      // sec
        lockDur,            // sec
        ref1, ref2, ref3,   // bps
        refClaimInt         // sec (0 = เคลม USDT ได้ทันที)
      )
      .send({ from: account });

    toast("✅ อัปเดตพารามิเตอร์สำเร็จ", "ok");
    await refreshAll();
  } catch (e) {
    console.error(e);
    toast("❌ setParams ล้มเหลว: " + (e?.message || e), "err");
  }
}

async function ownerWithdrawKJC() {
  if (!account) return toast("กรุณาเชื่อมต่อกระเป๋าก่อน", "err");
  try {
    const to = $("withdrawTo").value.trim();
    const amt = $("withdrawAmt").value.trim();
    if (!to || !amt) return toast("กรอกจำนวนและปลายทางให้ครบ", "err");

    const wei = toWeiDecimal(amt, window.DECIMALS.KJC || 18);
    toast("⏳ ส่งธุรกรรมถอน KJC...");
    await contract.methods.ownerWithdrawKJC(wei, to).send({ from: account });
    toast("✅ ถอน KJC สำเร็จ", "ok");
  } catch (e) {
    console.error(e);
    toast("❌ ถอน KJC ล้มเหลว: " + (e?.message || e), "err");
  }
}

async function ownerWithdrawUSDT() {
  if (!account) return toast("กรุณาเชื่อมต่อกระเป๋าก่อน", "err");
  try {
    const to = $("withdrawTo").value.trim();
    const amt = $("withdrawAmt").value.trim();
    if (!to || !amt) return toast("กรอกจำนวนและปลายทางให้ครบ", "err");

    const wei = toWeiDecimal(amt, window.DECIMALS.USDT || 18);
    toast("⏳ ส่งธุรกรรมถอน USDT...");
    await contract.methods.ownerWithdrawUSDT(wei, to).send({ from: account });
    toast("✅ ถอน USDT สำเร็จ", "ok");
  } catch (e) {
    console.error(e);
    toast("❌ ถอน USDT ล้มเหลว: " + (e?.message || e), "err");
  }
}

async function airdropStake() {
  if (!account) return toast("กรุณาเชื่อมต่อกระเป๋าก่อน", "err");
  try {
    let users = $("airUsers").value.trim().split(/\n+/).map(s => s.trim()).filter(Boolean);
    let amounts = $("airAmounts").value.trim().split(/\n+/).map(s => s.trim()).filter(Boolean);
    let startTimeStr = $("airStart").value.trim();

    if (users.length === 0) return toast("ใส่รายชื่อ address อย่างน้อย 1 แอดเดรส", "err");
    if (users.length !== amounts.length) return toast("จำนวน address ไม่เท่ากับจำนวน amounts", "err");

    const amountsWei = amounts.map(a => toWeiDecimal(a, window.DECIMALS.KJC || 18));
    const startTime = startTimeStr ? startTimeStr : Math.floor(Date.now() / 1000).toString();

    toast("⏳ ส่งธุรกรรม Airdrop Stake...");
    await contract.methods.airdropStakes(users, amountsWei, startTime).send({ from: account });
    toast("✅ Airdrop Stake สำเร็จ", "ok");
  } catch (e) {
    console.error(e);
    toast("❌ Airdrop ล้มเหลว: " + (e?.message || e), "err");
  }
}

async function doPause() {
  if (!account) return toast("กรุณาเชื่อมต่อกระเป๋าก่อน", "err");
  try {
    toast("⏳ ส่งธุรกรรม Pause...");
    await contract.methods.pause().send({ from: account });
    toast("✅ Paused", "ok");
    await refreshAll();
  } catch (e) {
    console.error(e);
    toast("❌ Pause ล้มเหลว: " + (e?.message || e), "err");
  }
}

async function doUnpause() {
  if (!account) return toast("กรุณาเชื่อมต่อกระเป๋าก่อน", "err");
  try {
    toast("⏳ ส่งธุรกรรม Unpause...");
    await contract.methods.unpause().send({ from: account });
    toast("✅ Unpaused", "ok");
    await refreshAll();
  } catch (e) {
    console.error(e);
    toast("❌ Unpause ล้มเหลว: " + (e?.message || e), "err");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  $("btnConnect").addEventListener("click", connectWallet);
  $("btnSetParams").addEventListener("click", setParams);
  $("btnWdKJC").addEventListener("click", ownerWithdrawKJC);
  $("btnWdUSDT").addEventListener("click", ownerWithdrawUSDT);
  $("btnAirdrop").addEventListener("click", airdropStake);
  $("btnPause").addEventListener("click", doPause);
  $("btnUnpause").addEventListener("click", doUnpause);

  // แสดงที่อยู่สัญญาทันที (ก่อนเชื่อมต่อ)
  $("ca").textContent = window.ADDR?.CONTRACT || "—";
});
