# PoolMaster README

## Contract Description

![CZ4153@2x.png](PoolMaster%20README%20md%20dc6663a4b05f4f19aa96a9f925fc15c3/CZ41532x.png)

When users stake KNC in KyberDAO, they are given voting power to vote for various campaigns, as well as a portion of the rewards generated from Kyber Network’s swap fees. To allow users to not have to manually vote for campaign (which can be costly), Kyber provides KNC token delegation services, which is facilitated by the PoolMaster contract.

## Upgrade Mechanism

- `PoolMaster` uses the **Unstructured Storage Proxy** pattern to handle storage clashes between implementation versions, and the **Transparent Proxy** pattern to handle delegation of function calls between the proxy and implementation contracts.
- With this strategy, there are a few important caveats to take note of
    1. Implementation contracts must not have constructors, only initializers
    2. State variables must be append-only across implementation versions to avoid overwriting old variables

## Features

- [x]  Upgradeability
- [x]  Tests using mainnet forking features
    - To run tests on network forked from mainnet, set the following environement variables
- [x]  README
- [ ]  Gas Optimizations
- [ ]  Formal verification for tests
- [ ]  Upgraded solidity version for PoolMaster (will affect package dependencies for other contracts, so this is skipped)
- [x]  Hardhat tasks for deployment — `/deployment/poolMasterDeploy.js` and `/deployment/poolMasterUpgrade.js`

## Local Deployment

1. Including the following variables in a `.env` file in the root of the project, or by defining them in your terminal
    
    
    |  | Description | Example |
    | --- | --- | --- |
    | ETH_NODE_URL | Archival Node provider e.g. Alchemy | https://eth-mainnet.alchemyapi.io/v2/<key> |
    | FORK_BLOCK | Block to pin to | 13682292 (Nov-25-2021 07:56:43 AM +UTC) |
2. Start a local node forked from mainnet by using `yarn hardhat node`
3. To deploy `PoolMaster`, open another terminal and run `yarn hardhat deployProxy --network develop`
4. To upgrade `PoolMaster`, run `yarn hardhat upgradeProxy --network develop`

## Function Definitions

| Function | Access Modifier | Arguments | Return Value | Description |
| --- | --- | --- | --- | --- |
| `depositWithNewKnc` | external | `uint256 tokenWei` : Amount of `newKNC` to transfer | Void | - Transfers `tokenWei` of `newKnc` from user to `PoolMaster` contract<br> - Calls `_deposit(tokenWei, user)` |
| `depositWithOldKnc` | external | `uint256 tokenWei` : Amount of `oldKNC` to transfer | Void | - Transfers `tokenWei` of `oldKnc` from user to `PoolMaster`<br> - Mint `newKnc` using `oldKnc`<br> - Calls `_deposit(tokenWei, user)` |
| `withdraw` | external | `uint256 tokensToRedeemTwei` : Amount of staking tokens worth of `newKNC` to withdraw | Void | - Calculates `proRataKnc` from `tokensToRedeemTwei` (poolMaster token)<br> - Unstakes `proRataKnc` (`proRataKnc` is transferred from `kyberStaking` to `poolMaster`)<br> - Subtracts admin fees (`FeeTypes.BURN`)<br> - Transfers `proRataKnc` from `PoolMaster` to user<br>- Burns `tokensToRedeemTwei` staking tokens |
| `vote` | external<br> onlyOperator | `uint256[] calldata proposalIds` : Array of KyberDAO proposalIDs<br> `uint256[] calldata optionBitMasks` : Array of voting options for each proposal | Void | - Submits proposals to vote on and options bitmask to kyberGovernance |
| `claimReward` | external<br> onlyOperator | `uint256 cycle` : source from KyberAPI<br> `uint256 index` : source from KyberAPI<br> `IERC20Ext[] calldata tokens` : array of tokens to liquidate<br> `uint256[] calldata cumulativeAmounts` : array of cumulative amounts to claim upto for each token<br> `bytes32[] calldata merkleProof` : array of merkleProofs for each token claimed | Void | - Calls `rewardDistributor.claim()` , passing in the cumulative amounts of various ERC-20 tokens to claim<br> - Stake the entirety of `availableKnc` (some knc might be claimed above) excluding admin fees. |
| `liquidateTokensToKnc` | external<br> onlyOperator | `IERC20Ext[] calldata tokens` :  array of tokens to liquidate<br> `uint256[] calldata minRates` : minimum rate to liquidate tokens to knc | Void | - Swaps other ERC-20 tokens to knc<br> - Calculates `availableKnc` as all available knc excluding admin fees and subtract `FeeTypes.CLAIM`<br> - Stake the entirety of `availableKnc` left, excluding admin fees. |
| `approveKyberProxyContract` | external<br> onlyOperator | `IERC20Ext token` : target token to withdraw from<br> `bool giveAllowance` : whether to give allowance or not | Void | - Approve `kyberProxy` to allow it to withdraw token on `poolMaster`'s behalf |
| `withdrawAdminFee` | external<br> onlyOperator |  | Void | - Transfers admin fees (in knc) to the admin |
| `stakeAdminFee` | external<br> onlyOperator |  | Void | - `_deposit()` with accumulated admin fees to the admin |
| `getLatestStake` | public<br> view |  | `uint256 latestStake` | - Get total amount of knc that `PoolMaster` has staked in `kyberStaking` |
| `getAvailableNewKncBalanceTwei` | public<br> view |  | uint256 | - Get amount of knc left excluding admin fees |
| `getFeeRate` | public<br> view | `FeeTypes _type`: Which fee type to get (`FeeTypes.MINT`, `FeeTypes.CLAIM`, `FeeTypes.BURN`) | uint256 | - Returns amount for each fee type. |
| `getProRataKnc` | public<br> view |  | uint256 | - Calculates how much 1 poolMaster token is worth in terms of knc |
| `_deposit` | internal | `uint256 tokenWei`: Amount of knc to deposit<br> address user : User to mint PoolMaster token for | Void | - From `tokenWei`, `FeeTypes.MINT` is deducted if the user is not admin to form `depositAmount`<br> - `depositAmount` is staked using `kyberStaking` i.e. transfered to `kyberStaking`<br> - An appropriate amount of `poolMaster` token is calculated and minted to the user. |