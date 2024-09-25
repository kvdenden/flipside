// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {Resolver} from "./Resolver.sol";
import {Outcome} from "./Outcome.sol";
import {OutcomeToken} from "./OutcomeToken.sol";

contract Market {
    string public description;

    IERC20 public collateralToken;

    OutcomeToken public longToken;
    OutcomeToken public shortToken;

    Resolver private _resolver;
    bytes32 private _resolutionId;

    event Minted(address indexed from, address indexed to, uint256 amount);
    event Redeemed(address indexed from, address indexed to, uint256 amount);
    event Settled(address indexed from, address indexed to, uint256 amount);

    modifier whenResolved() {
        require(resolved(), "Market not resolved");
        _;
    }

    constructor(string memory pairName_, string memory description_, IERC20 collateral_, Resolver resolver_) {
        longToken = new OutcomeToken(address(this), string.concat(pairName_, " Long"), "LONG");
        shortToken = new OutcomeToken(address(this), string.concat(pairName_, " Short"), "SHORT");

        description = description_;
        collateralToken = collateral_;

        _resolver = resolver_;
    }

    function mint(address to, uint256 amount) external {
        collateralToken.transferFrom(msg.sender, address(this), amount);

        longToken.mint(to, amount);
        shortToken.mint(to, amount);

        emit Minted(msg.sender, to, amount);
    }

    function redeem(address to, uint256 amount) external {
        longToken.burn(msg.sender, amount);
        shortToken.burn(msg.sender, amount);

        _payout(to, amount);

        emit Redeemed(msg.sender, to, amount);
    }

    function settle(address to, uint256 longAmount, uint256 shortAmount)
        external
        whenResolved
        returns (uint256 amount)
    {
        longToken.burn(msg.sender, longAmount);
        shortToken.burn(msg.sender, shortAmount);

        Outcome outcome_ = outcome();
        amount = _calculatePayoutAmount(outcome_, longAmount, shortAmount);

        _payout(to, amount);

        emit Settled(msg.sender, to, amount);
    }

    function startResolution() external {
        require(_resolutionId == 0, "Already started resolution");

        _resolutionId = _resolver.initializeQuery(description);
    }

    function resolved() public view returns (bool) {
        return _resolutionId != 0 && _resolver.resolved(_resolutionId);
    }

    function outcome() public view whenResolved returns (Outcome) {
        return _resolver.outcome(_resolutionId);
    }

    function _payout(address to, uint256 amount) private {
        collateralToken.transfer(to, amount);
    }

    function _calculatePayoutAmount(Outcome outcome_, uint256 longAmount, uint256 shortAmount)
        private
        pure
        returns (uint256)
    {
        if (outcome_ == Outcome.Yes) return longAmount;
        if (outcome_ == Outcome.No) return shortAmount;

        return (longAmount + shortAmount) / 2;
    }
}
