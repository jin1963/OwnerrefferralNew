/* owner.js — KJC Owner Console (BSC)
 * - เชื่อมต่อกระเป๋า
 * - แสดงพารามิเตอร์ APR/Intervals/Lock
 * - ปรับ Ref-claim interval = 0s (Real-Time) / 3 วัน
 * - จัดการแพ็กเกจ (setPackage)
 * - ถอน USDT / KJC จากสัญญา
 * - (ปลอดภัย): ตรวจ owner-on-chain ก่อนกดปุ่ม admin
 */

let web3, provider, account, sale, usdt, kjc;

// ---------- helpers ----------
const el = (id) => document.getElementById(id);
const fmt = (v, dec = 18) => {
  try {
    const s = BigInt(v).toString();
    if (dec === 0) return s;
    const neg = s.startsWith("-");
    const raw = neg ? s.slice(1) : s;
    const pad = raw.padStart(dec + 1, "0");
    const a = pad.slice(0, pad.length - dec);
    const b = pad.slice(pad.length - dec).replace(/0+$/, "");
    return (neg ? "-" : "") + (b ? `${a}.${b}` : a);
  } catch { return String(v); }
};
const toWei = (x, dec = 18) => web3.utils.toBN(web3.utils.toWei(String(x), "ether")).toString();

// แจ้งเตือนแบบเรียบง่าย
function toast(msg) {
  const t = el("toast");
  if (!t) { alert(msg); return; }
  t.style.display = "block";
  t.textContent = msg;
  setTimeout(() => (t.style.display = "none"), 3500);
}

// ป้องกันกดปุ่มก่อน DOM พร้อม
function bind(id, fn) {
  const n = el(id);
  if (n) n.addEventListener("click", fn);
}

// ---------- connect ----------
async function connectWallet() {
  try {
    provider = window.ethereum || window.bitget?.ethereum || window.okxwallet?.ethereum || window.bitkeep?.ethereum;
    if (!provider) return toast("❌ ไม่พบกระเป๋า (MetaMask/Bitget/OKX)");

    await provider.request({ method: "eth_requestAccounts" });
    web3 = new Web3(provider);

    // chain check
    const chainId = await provider.request({ method: "eth_chainId" });
    if (chainId !== window.NETWORK.chainIdHex) {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: window.NETWORK.chainIdHex }]
      });
    }

    const accs = await web3.eth.getAccounts();
    account = accs[0];
    el("wallet") && (el("wallet").textContent = `✅ ${account.slice(0,6)}...${account.slice(-4)}`);

    // ตรวจ ABI/ADDR
    if (!window.SALE_ABI || !window.ADDR?.CONTRACT) {
      toast("❌ ไม่มี ABI หรือ CONTRACT address ใน config.js");
      throw new Error("Missing ABI/ADDR");
    }

    sale = new web3.eth.Contract(window.SALE_ABI, window.ADDR.CONTRACT);
    el("ca") && (el("ca").textContent = window.ADDR.CONTRACT);
    el("netChain") && (el("netChain").textContent = "BSC Mainnet (0x38)");

    // สร้าง instance USDT/KJC ถ้ามีใน config
    if (window.ADDR?.USDT && window.ERC20_MINI_ABI) {
      usdt = new web3.eth.Contract(window.ERC20_MINI_ABI, window.ADDR.USDT);
    }
    if (window.ADDR?.KJC && window.ERC20_MINI_ABI) {
      kjc  = new web3.eth.Contract(window.ERC20_MINI_ABI, window.ADDR.KJC);
    }

    await refreshAll();

    provider.on?.("accountsChanged", () => location.reload());
    provider.on?.("chainChanged", () => location.reload());
  } catch (e) {
    console.error(e);
    toast(`เชื่อมต่อไม่สำเร็จ: ${e?.message || e}`);
  }
}

// ---------- read params ----------
async function getParam(fnName) {
  try {
    if (!sale?.methods?.[fnName]) return null;
    return await sale.methods[fnName]().call();
  } catch { return null; }
}

async function loadParams() {
  // รองรับทั้งสัญญาเวอร์ชันเดิม/ใหม่ (ชื่อฟังก์ชันเดียวกัน)
  const aprBps       = await getParam("REWARD_APR_BPS");
  const claimStake   = await getParam("CLAIM_INTERVAL_STAKE");
  const lockDur      = await getParam("LOCK_DURATION");
  const ref1         = await getParam("REF1_BPS");
  const ref2         = await getParam("REF2_BPS");
  const ref3         = await getParam("REF3_BPS");
  const refClaimInt  = await getParam("REF_CLAIM_INTERVAL");

  // แสดงผล
  el("aprBps")        && (el("aprBps").textContent       = aprBps ?? "-");
  el("stakeInterval") && (el("stakeInterval").textContent= claimStake ?? "-");
  el("lockDuration")  && (el("lockDuration").textContent = lockDur ?? "-");
  el("refInterval")   && (el("refInterval").textContent  = refClaimInt ?? "-");

  // เก็บไว้ใช้ตอน setParams
  window.__KJC_PARAMS__ = {
    aprBps: aprBps ? web3.utils.toBN(aprBps) : null,
    claimStake: claimStake ? web3.utils.toBN(claimStake) : null,
    lockDur: lockDur ? web3.utils.toBN(lockDur) : null,
    ref1: ref1 ? web3.utils.toBN(ref1) : null,
    ref2: ref2 ? web3.utils.toBN(ref2) : null,
    ref3: ref3 ? web3.utils.toBN(ref3) : null,
    refClaimInt: refClaimInt ? web3.utils.toBN(refClaimInt) : null,
  };
}

// ---------- balances ----------
async function loadBalances() {
  try {
    if (usdt) {
      const b = await usdt.methods.balanceOf(window.ADDR.CONTRACT).call();
      el("usdtBal") && (el("usdtBal").textContent = `${fmt(b, window.DECIMALS?.USDT ?? 18)}  USDT`);
    }
  } catch {}
  try {
    if (kjc) {
      const b = await kjc.methods.balanceOf(window.ADDR.CONTRACT).call();
      el("kjcBal") && (el("kjcBal").textContent = `${fmt(b, window.DECIMALS?.KJC ?? 18)}  KJC`);
    }
  } catch {}
  try {
    // owner on-chain
    if (sale?.methods?.owner) {
      const o = await sale.methods.owner().call();
      el("ownerAddr") && (el("ownerAddr").textContent = o);
      el("ownerWarn") && (el("ownerWarn").textContent =
        (o?.toLowerCase() === account?.toLowerCase()) ? "คุณคือ Owner — สามารถจัดการสัญญาได้" : "ไม่ได้เชื่อมด้วยบัญชี Owner");
    }
  } catch {}
}

// ---------- packages ----------
async function loadPackages() {
  const box = el("pkgList");
  if (!box) return;
  box.innerHTML = "";
  try {
    if (!sale?.methods?.packageCount || !sale?.methods?.packages) {
      box.innerHTML = "<div class='muted'>สัญญาเวอร์ชันนี้ไม่รองรับ packages()</div>";
      return;
    }
    const n = await sale.methods.packageCount().call();
    for (let i = 0; i < Number(n); i++) {
      const p = await sale.methods.packages(i).call();
      const div = document.createElement("div");
      div.className = "pkg";
      div.innerHTML = `
        <div><b>#${i}</b> — active: <b>${p.active}</b></div>
        <div>USDT in: ${fmt(p.usdtIn, window.DECIMALS?.USDT ?? 18)}</div>
        <div>KJC out: ${fmt(p.kjcOut, window.DECIMALS?.KJC ?? 18)}</div>
        <button class="btn" data-id="${i}">แก้ไข (เติมฟอร์ม)</button>
      `;
      box.appendChild(div);
    }
    box.querySelectorAll("button.btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.dataset.id);
        const p  = await sale.methods.packages(id).call();
        el("pkgIdIn").value    = String(id);
        el("pkgUsdtIn").value  = web3.utils.fromWei(p.usdtIn, "ether");
        el("pkgKjcOut").value  = web3.utils.fromWei(p.kjcOut, "ether");
        el("pkgActive").value  = p.active ? "true" : "false";
        el("pkgUsdtIn").focus();
      });
    });
  } catch (e) {
    console.error(e);
    box.innerHTML = "<div class='err'>โหลดแพ็กเกจไม่สำเร็จ</div>";
  }
}

// ---------- actions ----------
async function ensureOwner() {
  if (!sale?.methods?.owner) return true; // ถ้าไม่มี owner() ก็ปล่อย
  const o = await sale.methods.owner().call();
  if (o?.toLowerCase() !== account?.toLowerCase()) {
    toast("ต้องเชื่อมด้วยกระเป๋า Owner เท่านั้น");
    return false;
  }
  return true;
}

// setPackage(id, usdtIn, kjcOut, active)
async function setPackageAction() {
  try {
    if (!(await ensureOwner())) return;
    if (!sale?.methods?.setPackage) return toast("สัญญาไม่รองรับ setPackage()");
    const id   = el("pkgIdIn").value.trim();
    const uIn  = el("pkgUsdtIn").value.trim();
    const kOut = el("pkgKjcOut").value.trim();
    const act  = el("pkgActive").value === "true";
    if (!id || !uIn || !kOut) return toast("กรอกข้อมูลแพ็กเกจให้ครบ");

    await sale.methods
      .setPackage(
        web3.utils.toBN(id),
        toWei(uIn, window.DECIMALS?.USDT ?? 18),
        toWei(kOut, window.DECIMALS?.KJC ?? 18),
        act
      )
      .send({ from: account });

    toast("✅ อัปเดตแพ็กเกจสำเร็จ");
    await loadPackages();
  } catch (e) {
    console.error(e);
    toast(`ล้มเหลว: ${e?.message || e}`);
  }
}

// ถอน USDT / KJC
async function withdrawUSDT() {
  try {
    if (!(await ensureOwner())) return;
    if (!sale?.methods?.ownerWithdrawUSDT) return toast("สัญญาไม่รองรับ ownerWithdrawUSDT()");
    const to  = el("wdTo").value.trim();
    const amt = el("wdUsdtAmt").value.trim();
    if (!to || !amt) return toast("กรอกปลายทาง/จำนวนให้ครบ");
    await sale.methods.ownerWithdrawUSDT(toWei(amt, window.DECIMALS?.USDT ?? 18), to)
      .send({ from: account });
    toast("✅ ถอน USDT สำเร็จ");
    await loadBalances();
  } catch (e) { console.error(e); toast(`ล้มเหลว: ${e?.message || e}`); }
}
async function withdrawKJC() {
  try {
    if (!(await ensureOwner())) return;
    if (!sale?.methods?.ownerWithdrawKJC) return toast("สัญญาไม่รองรับ ownerWithdrawKJC()");
    const to  = el("wdTo").value.trim();
    const amt = el("wdKjcAmt").value.trim();
    if (!to || !amt) return toast("กรอกปลายทาง/จำนวนให้ครบ");
    await sale.methods.ownerWithdrawKJC(toWei(amt, window.DECIMALS?.KJC ?? 18), to)
      .send({ from: account });
    toast("✅ ถอน KJC สำเร็จ");
    await loadBalances();
  } catch (e) { console.error(e); toast(`ล้มเหลว: ${e?.message || e}`); }
}

// Quick Action: ปรับ ref claim interval
async function setRefClaimInterval(seconds) {
  try {
    if (!(await ensureOwner())) return;

    // ต้องมี setParams (เวอร์ชันใหม่)
    if (!sale?.methods?.setParams) return toast("สัญญาไม่รองรับ setParams()");

    // ต้องอ่านค่าปัจจุบันให้ครบ เพื่อนำไปใส่ใน setParams โดย “คงค่าเดิม” ทุกช่อง
    const P = window.__KJC_PARAMS__;
    if (!P || [P.aprBps,P.claimStake,P.lockDur,P.ref1,P.ref2,P.ref3].some(v => v==null)) {
      await loadParams();
    }
    const Q = window.__KJC_PARAMS__;
    if (!Q || [Q.aprBps,Q.claimStake,Q.lockDur,Q.ref1,Q.ref2,Q.ref3].some(v => v==null)) {
      return toast("อ่านค่าปัจจุบันไม่สำเร็จ จึงตั้งค่าไม่ได้");
    }

    await sale.methods
      .setParams(
        Q.aprBps.toString(),
        Q.claimStake.toString(),
        Q.lockDur.toString(),
        Q.ref1.toString(),
        Q.ref2.toString(),
        Q.ref3.toString(),
        web3.utils.toBN(seconds).toString()
      )
      .send({ from: account });

    toast("✅ อัปเดต Ref claim interval สำเร็จ");
    await loadParams();
  } catch (e) {
    console.error(e);
    toast(`ล้มเหลว: ${e?.message || e}`);
  }
}

// ---------- refresh ----------
async function refreshAll() {
  await Promise.all([loadParams(), loadBalances(), loadPackages()]);
}

// ---------- boot ----------
window.addEventListener("DOMContentLoaded", () => {
  // ผูกปุ่มอย่างปลอดภัย (ไม่มี element ก็ไม่ล้ม)
  bind("btnConnect", connectWallet);

  bind("btnSetPkg", setPackageAction);
  bind("btnWdUSDT", withdrawUSDT);
  bind("btnWdKJC", withdrawKJC);

  bind("btnRefRT", () => setRefClaimInterval(0));           // Real-Time
  bind("btnRef3D", () => setRefClaimInterval(3 * 24 * 60 * 60)); // 3 วัน

  // แสดง contract/chain บนจอ
  el("ca") && (el("ca").textContent = window.ADDR?.CONTRACT || "-");
  el("netChain") && (el("netChain").textContent = "BSC Mainnet (0x38)");
});
