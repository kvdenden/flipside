// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Outcome } from "../Outcome.sol";
import { OutcomeToken } from "../OutcomeToken.sol";

interface IMarket {
  function creator() external view returns (address);
  function title() external view returns (string memory);
  function description() external view returns (string memory);
  function expirationDate() external view returns (uint256);
  function collateralToken() external view returns (IERC20);
  function unitPrice() external view returns (uint256);
  function longToken() external view returns (OutcomeToken);
  function shortToken() external view returns (OutcomeToken);

  function resolved() external view returns (bool);
  function outcome() external view returns (Outcome);

  function mint(address to, uint256 amount) external;
  function redeem(address to, uint256 amount) external;
  function settle(address to, uint256 longAmount, uint256 shortAmount) external returns (uint256 amount);
}
