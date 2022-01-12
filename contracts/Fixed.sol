//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

library Fixed {
  using SafeMath for uint256;

  function toFixed(uint256 v) internal pure returns (uint256) {
    return v.mul(1e18);
  }

  function toInt(uint256 v) internal pure returns (uint256) {
    return v.div(1e18);
  }
}
