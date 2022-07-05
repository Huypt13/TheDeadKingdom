// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DeathKingdomCoin is ERC20, Ownable {
    constructor() ERC20("DeathKingdomCoin", "DKC") {
        _mint(msg.sender, 1000000000000000000 * 100000000);
    }

    // function mint(address to, uint256 amount) public onlyOwner {
    //     _mint(to, amount);
    // }
}
