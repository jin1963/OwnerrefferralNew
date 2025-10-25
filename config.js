// ===============================
// CONFIG: Owner DApp (KJC Referral + Auto-Stake)
// ===============================
window.NETWORK = { chainIdHex: "0x38" }; // BSC Mainnet

window.ADDR = {
  CONTRACT: "0x5727Bc65448528ebd6d186466F1c4E7ECe4b048E", // ✅ contract ปัจจุบัน
  USDT: "0x55d398326f99059fF775485246999027B3197955",
  KJC:  "0x2FB9b0F45278D62dc13Dc9F826F78e8E3774047D"
};

window.DECIMALS = { USDT: 18, KJC: 18 };

// --- ABI ที่ต้องใช้กับ Owner DApp (ตัดมาเฉพาะที่เรียกใช้) ---
window.SALE_ABI = [
  // views
  {"inputs":[],"name":"REWARD_APR_BPS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"CLAIM_INTERVAL_STAKE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"LOCK_DURATION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"REF_CLAIM_INTERVAL","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},

  // admin
  {"inputs":[
    {"internalType":"uint256","name":"aprBps","type":"uint256"},
    {"internalType":"uint256","name":"claimIntervalStake","type":"uint256"},
    {"internalType":"uint256","name":"lockDuration","type":"uint256"},
    {"internalType":"uint256","name":"ref1_bps","type":"uint256"},
    {"internalType":"uint256","name":"ref2_bps","type":"uint256"},
    {"internalType":"uint256","name":"ref3_bps","type":"uint256"},
    {"internalType":"uint256","name":"refClaimInterval","type":"uint256"}
  ],"name":"setParams","outputs":[],"stateMutability":"nonpayable","type":"function"},

  {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"to","type":"address"}],"name":"ownerWithdrawUSDT","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"to","type":"address"}],"name":"ownerWithdrawKJC","outputs":[],"stateMutability":"nonpayable","type":"function"},

  // airdrop stakes
  {"inputs":[{"internalType":"address[]","name":"users","type":"address[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"uint256","name":"startTime","type":"uint256"}],"name":"airdropStakes","outputs":[],"stateMutability":"nonpayable","type":"function"}
];

// Minimal ERC20 ABI
window.ERC20_MINI_ABI = [
  {"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"type":"function"},
  {"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"type":"function"}
];

console.log("✅ KJC Config Loaded\n" + window.ADDR.CONTRACT);
