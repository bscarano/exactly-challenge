# Exactly.finance Challenge

## Configuration

Use `.env` file to configure environment variables:

```
KOVAN_NODE        URL to provider RPC for KOVAN network
ACCOUNTS          Comma separated list of private-keys
CONTRACT_ADDRESS  Address of deployed control
```

NOTE: `ACCOUNTS` is used by tests and hardhat tasks. It should contain a comma-separated array of 3 private-keys. The tests and hardhat tasks use the 3 configured accounts in orderaccounts. The first account in the array should be the `owner`, the second is for `alice` and the third is for `bob`.

## Tests
The contract is tested using the array of accounts configured in `ACCOUNTS` in the `.env` file. Execute the tests either with

  `npm run test` or `npx hardhat test`

## Deployment
A deployment script is supplied to deploy the contract:
`npx hardhat --network kovan run scripts/deploy.js`

After deploying set the `CONTRACT` environment to the contract address to use the hardhat tasks.

* Deployed on Kovan: https://kovan.etherscan.io/address/0xfe7e4a0d162e6109ed58b01d622179c8b4936d9a

* Verified Contract: https://kovan.etherscan.io/address/0xfe7e4a0d162e6109ed58b01d622179c8b4936d9a#code

## Hardhat Tasks
These tasks use the accounts configured in `ACCOUNTS` and communicates with the contract using the address `CONTRACT`.

Each command has a default account that it uses. The accounts are referred to using their index. Index 0 is the owner address used to deploy the contract.


```
  pool:total        	Prints the pool total deposits & rewards
  pool:deposit      	Deposit into pool
  pool:depositreward	Deposit Reward into pool
  pool:withdraw     	Withdraw deposits and rewards
  pool:balance      	Balance of deposits for the given account
  pool:reward       	Share of rewards due to the given account
```

## pool:total
Displays the `totalDeposits` and `totalRewards` in the contract and the total of both.

## pool:deposit
Stakes ETH in the contract

```
  --account	Account index to use (default=1) (default: "1")
  --amount 	Amount to deposit (wei)
```  
## pool:depositreward
Deposits a reward to all of the stakers 

```
  --account	Account index to use (default=0) (default: "0")
  --amount 	Amount to reward (wei)
```

## pool:withdraw
Withdraw deposits and share of rewards

```
  --account	Account index to use (default=1) (default: "1")
```

## pool:balance
Balance of deposits for the given account

```
  --account	Account index to use (default=1) (default: "1")
```

## pool:reward
Share of rewards due to the given account

  --account	Account index to use (default=1) (default: "1")

