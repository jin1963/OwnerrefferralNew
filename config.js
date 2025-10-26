// ===============================
// Unified CONFIG for KJC (Owner + Public)
// รองรับทั้ง V1 (สัญญาเก่า ไม่มี setParams) และ V3 (มี setParams/pause/unpause)
// ===============================

window.NETWORK = { chainIdHex: "0x38" }; // BSC Mainnet

// ===== เปลี่ยนตรงนี้ตัวเดียวเพื่อชี้สัญญา =====
window.ADDR = {
  CONTRACT: "0x5727Bc65448528ebd6d186466F1c4E7ECe4b048E", // <-- ถ้าอยากใช้ V3 ให้เปลี่ยนเป็น 0xf93DB01004C6Cf68f49de2e6bFfafB96C98201b7
  USDT:     "0x55d398326f99059fF775485246999027B3197955",
  KJC:      "0x2FB9b0F45278D62dc13Dc9F826F78e8E3774047D"
};

window.DECIMALS = { USDT: 18, KJC: 18 };

// ---------- Minimal ERC20 ----------
window.ERC20_MINI_ABI = [
  {"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"type":"function"},
  {"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"type":"function"},
  {"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"type":"function"},
  {"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"type":"function"}
];

// ---------- ABI: V1 (สัญญาเก่า – ไม่มี setParams/pause/unpause) ----------
window.SALE_ABI_V1 = [
  {"inputs":[{"internalType":"address","name":"usdt_","type":"address"},{"internalType":"address","name":"kjc_","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"packageId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"usdtIn","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"kjcOut","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"stakeIndex","type":"uint256"}],"name":"BoughtAndAutoStaked","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amountUSDT","type":"uint256"}],"name":"ClaimReferral","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"index","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amountKJC","type":"uint256"}],"name":"ClaimStakeReward","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"usdtIn","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"kjcOut","type":"uint256"},{"indexed":false,"internalType":"bool","name":"active","type":"bool"}],"name":"PackageSet","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"ref","type":"address"},{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint8","name":"level","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"usdtAmt","type":"uint256"}],"name":"ReferralAccrued","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"ref","type":"address"}],"name":"ReferralBound","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"index","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"principalKJC","type":"uint256"}],"name":"Unstake","type":"event"},
  {"inputs":[],"name":"BPS_DENOM","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"CLAIM_INTERVAL_STAKE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"KJC","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"LOCK_DURATION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"REF1_BPS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"REF2_BPS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"REF3_BPS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"REF_CLAIM_INTERVAL","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"REWARD_APR_BPS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"SECONDS_PER_YEAR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"USDT","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"accruedRefUSDT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"packageId","type":"uint256"},{"internalType":"address","name":"ref","type":"address"}],"name":"buyPackage","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"canUnstake","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"claimReferralReward","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"claimStakingReward","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getStakeCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"lastRefClaimAt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"nextStakeClaimTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"to","type":"address"}],"name":"ownerWithdrawKJC","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"to","type":"address"}],"name":"ownerWithdrawUSDT","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"packageCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"packages","outputs":[{"internalType":"uint256","name":"usdtIn","type":"uint256"},{"internalType":"uint256","name":"kjcOut","type":"uint256"},{"internalType":"bool","name":"active","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"pendingStakeReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"referrerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"usdtIn","type":"uint256"},{"internalType":"uint256","name":"kjcOut","type":"uint256"},{"internalType":"bool","name":"active","type":"bool"}],"name":"setPackage","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakes","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"lastClaim","type":"uint256"},{"internalType":"bool","name":"withdrawn","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"}
];

// ---------- ABI: V3 (สัญญาใหม่ – มี setParams/pause/unpause/airdropStakes) ----------
window.SALE_ABI_V3 = [
  {"inputs":[{"internalType":"address","name":"usdt_","type":"address"},{"internalType":"address","name":"kjc_","type":"address"},{"internalType":"uint256","name":"aprBps","type":"uint256"},{"internalType":"uint256","name":"claimIntervalStake","type":"uint256"},{"internalType":"uint256","name":"lockDuration","type":"uint256"},{"internalType":"uint256","name":"ref1_bps","type":"uint256"},{"internalType":"uint256","name":"ref2_bps","type":"uint256"},{"internalType":"uint256","name":"ref3_bps","type":"uint256"},{"internalType":"uint256","name":"refClaimInterval","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"startTime","type":"uint256"}],"name":"AirdropStake","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"packageId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"usdtIn","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"kjcOut","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"stakeIndex","type":"uint256"}],"name":"BoughtAndAutoStaked","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amountUSDT","type":"uint256"}],"name":"ClaimReferral","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"index","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amountKJC","type":"uint256"}],"name":"ClaimStakeReward","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"usdtIn","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"kjcOut","type":"uint256"},{"indexed":false,"internalType":"bool","name":"active","type":"bool"}],"name":"PackageSet","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"aprBps","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"claimInt","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"lockDur","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"r1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"r2","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"r3","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"refClaimInt","type":"uint256"}],"name":"ParamsUpdated","type":"event"},
  {"anonymous":false,"inputs":[],"name":"Paused","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"ref","type":"address"},{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint8","name":"level","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"usdtAmt","type":"uint256"}],"name":"ReferralAccrued","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"ref","type":"address"}],"name":"ReferralBound","type":"event"},
  {"anonymous":false,"inputs":[],"name":"Unpaused","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"index","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"principalKJC","type":"uint256"}],"name":"Unstake","type":"event"},
  {"inputs":[{"internalType":"address[]","name":"users","type":"address[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"uint256","name":"startTime","type":"uint256"}],"name":"airdropStakes","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"packageId","type":"uint256"},{"internalType":"address","name":"ref","type":"address"}],"name":"buyPackage","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"pendingStakeReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getStakeCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"claimStakingReward","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"claimReferralReward","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"aprBps","type":"uint256"},{"internalType":"uint256","name":"claimIntervalStake","type":"uint256"},{"internalType":"uint256","name":"lockDuration","type":"uint256"},{"internalType":"uint256","name":"ref1_bps","type":"uint256"},{"internalType":"uint256","name":"ref2_bps","type":"uint256"},{"internalType":"uint256","name":"ref3_bps","type":"uint256"},{"internalType":"uint256","name":"refClaimInterval","type":"uint256"}],"name":"setParams","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"}
];

// ---------- ตัวเลือก ABI อัตโนมัติ ----------
// ถ้ารู้แน่ว่าที่อยู่ไหนเป็นเวอร์ชันใด ให้ map ตรงนี้ได้เลย
window.CONTRACT_ABI_BY_ADDRESS = {
  // "0x5727Bc65448528ebd6d186466F1c4E7ECe4b048E".toLowerCase(): window.SALE_ABI_V1,
  // "0xf93DB01004C6Cf68f49de2e6bFfafB96C98201b7".toLowerCase(): window.SALE_ABI_V3,
};

// ฟังก์ชันเลือก ABI: 1) map; 2) เดาจากการมี setParams ใน ABI เป้าหมาย; 3) fallback = V1
window.selectSaleAbi = function (addr) {
  const key = (addr || "").toLowerCase();
  if (window.CONTRACT_ABI_BY_ADDRESS[key]) return window.CONTRACT_ABI_BY_ADDRESS[key];
  // ถ้าคุณจะบังคับใช้ V3 เสมอ ให้ return SALE_ABI_V3 เลยก็ได้
  return window.SALE_ABI_V3; // ← แนะนำให้ใช้ V3 เป็นค่าเริ่มต้น (ถ้าเรียกเมทอดไม่เจอ จะ error เร็ว ทำให้รู้ว่าเป็น V1)
};
console.log("✅ KJC Config Loaded", window.ADDR.CONTRACT);
