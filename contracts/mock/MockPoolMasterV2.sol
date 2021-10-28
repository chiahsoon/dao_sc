// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.7.6;

import {IERC20Ext, IKyberNetworkProxy} from './PoolMaster.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import {IERC20Ext} from '@kyber.network/utils-sc/contracts/IERC20Ext.sol';
import {ERC20BurnableUpgradeable} from '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20BurnableUpgradeable.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import {ReentrancyGuardUpgradeable} from '@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol';
import {OwnableUpgradeable} from '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import {IKyberStaking} from '../interfaces/staking/IKyberStaking.sol';
import {IRewardsDistributor} from '../interfaces/rewardDistribution/IRewardsDistributor.sol';
import {IKyberGovernance} from '../interfaces/governance/IKyberGovernance.sol';
import {PermissionAdminUpgradeable} from './PermissionAdminUpgradeable.sol';
import {PermissionOperatorsUpgradeable} from './PermissionOperatorsUpgradeable.sol';

contract PoolMasterV2 is PermissionAdminUpgradeable, PermissionOperatorsUpgradeable, ReentrancyGuardUpgradeable, 
ERC20BurnableUpgradeable {
  struct Fees {
    uint256 mintFeeBps;
    uint256 claimFeeBps;
    uint256 burnFeeBps;
  }

  event FeesSet(uint256 mintFeeBps, uint256 burnFeeBps, uint256 claimFeeBps);
  enum FeeTypes {MINT, CLAIM, BURN}

  IERC20Ext internal constant ETH_ADDRESS = IERC20Ext(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
  uint256 internal constant PRECISION = (10**18);
  uint256 internal constant BPS = 10000;
  uint256 internal constant MAX_FEE_BPS = 1000; // 10%
  uint256 internal constant INITIAL_SUPPLY_MULTIPLIER = 10;
  Fees public adminFees;
  uint256 public withdrawableAdminFees;

  IKyberNetworkProxy public kyberProxy;
  IKyberStaking public kyberStaking;
  IRewardsDistributor public rewardsDistributor;
  IKyberGovernance public kyberGovernance;
  IERC20Ext public newKnc;
  IERC20Ext private oldKnc;

  function checkUpgraded() public pure returns (string memory) {
    return 'upgraded';
  }
}
