// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {OutcomeToken} from "./OutcomeToken.sol";

contract Market {
    IERC20 public collateralToken;
    OutcomeToken public longToken;
    OutcomeToken public shortToken;

    constructor(string memory pairName_, IERC20 collateral_) {
        collateralToken = collateral_;

        longToken = new OutcomeToken(address(this), string.concat(pairName_, " Long"), "LONG");
        shortToken = new OutcomeToken(address(this), string.concat(pairName_, " Short"), "SHORT");
    }

    function mint(address to, uint256 amount) public {
        collateralToken.transferFrom(msg.sender, address(this), amount);

        longToken.mint(to, amount);
        shortToken.mint(to, amount);
    }

    function redeem(address to, uint256 amount) public {
        longToken.burn(msg.sender, amount);
        shortToken.burn(msg.sender, amount);

        collateralToken.transfer(to, amount);
    }
}
