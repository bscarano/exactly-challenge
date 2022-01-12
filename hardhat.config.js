const { Wallet } = require("ethers");
const { task } = require("hardhat/config");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-web3");
require("dotenv/config");
const BigNumber = require('bignumber.js');

const accounts = process.env.ACCOUNTS.split(',');

async function getPoolInstance(hre) {
  const contract = process.env.CONTRACT_ADDRESS;
  const ETHPool = await hre.ethers.getContractFactory("ETHPool");
  const pool = ETHPool.attach(contract);
  return pool;
}

task("pool:total", "Prints the pool total deposits & rewards")
  .addOptionalParam("account", "Account index to use (default=1)", "1")
  .setAction(async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();  
    const account = accounts[parseInt(taskArgs.account)];

    const pool = await getPoolInstance(hre);
    const totalDeposits = await pool.connect(account).totalDeposits({ from : account.address });
    const totalRewards = await pool.connect(account).totalRewards({ from : account.address });
    const total = totalDeposits.add(totalRewards);
    
    console.log('totalDeposits', totalDeposits.toString());
    console.log('totalRewards', totalRewards.toString());
    console.log('total', total.toString());
  });

task("pool:deposit", "Deposit into pool")
  .addParam("amount", "Amount to deposit (wei)")
  .addOptionalParam("account", "Account index to use (default=1)", "1")
  .setAction(async (taskArgs) => {
    const accounts = await hre.ethers.getSigners();  
    const account = accounts[parseInt(taskArgs.account)];
    const amount = ethers.BigNumber.from(taskArgs.amount);

    console.log('deposit', amount.toString(), 'from', account.address);

    const pool = await getPoolInstance(hre);
    const tx = await pool.connect(account).deposit({ from: account.address, value: amount });
    console.log(tx);
  });

task("pool:depositreward", "Deposit Reward into pool")
  .addParam("amount", "Amount to reward (wei)")
  .addOptionalParam("account", "Account index to use (default=0)", "0")
  .setAction(async (taskArgs) => {
    const accounts = await hre.ethers.getSigners();  
    const account = accounts[parseInt(taskArgs.account)];
    const amount = ethers.BigNumber.from(taskArgs.amount);

    console.log('depositreward', taskArgs.amount, 'from', account.address);

    const pool = await getPoolInstance(hre);
    const tx = await pool.connect(account).depositReward({ from: account.address, value: amount });
    console.log(tx);
  });

task("pool:withdraw", "Withdraw deposits and rewards")
  .addOptionalParam("account", "Account index to use (default=1)", "1")
  .setAction(async (taskArgs) => {
    const accounts = await hre.ethers.getSigners();  
    const account = accounts[parseInt(taskArgs.account)];

    console.log('withdraw', 'to', account.address);

    const pool = await getPoolInstance(hre);
    const tx = await pool.connect(account).withdraw({ from: account.address });
    console.log(tx);
  });

task("pool:balance", "Balance of deposits for the given account")
  .addOptionalParam("account", "Account index to use (default=1)", "1")
  .setAction(async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();  
    const account = accounts[parseInt(taskArgs.account)];
    console.log('balance', 'from', account.address);

    const pool = await getPoolInstance(hre);
    const balance = await pool.connect(account).balance({ from: account.address });
    console.log(balance.toString());
  });

task("pool:reward", "Share of rewards due to the given account")
  .addOptionalParam("account", "Account index to use (default=1)", "1")
  .setAction(async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();  
    const account = accounts[parseInt(taskArgs.account)];
    console.log('reward', 'from', account.address);

    const pool = await getPoolInstance(hre);
    const balance = await pool.connect(account).reward({ from: account.address });
    console.log(balance.toString());
  });

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();  
  for (const account of accounts) {
    console.log(account.address);
  }
});  

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  defaultNetwork: "hardhat",
  networks: {
    kovan: {
      url: process.env.KOVAN_NODE,
      accounts
    }
  }
};
