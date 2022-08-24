// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./ILinkWallet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LinkWallet is ILinkWallet, Ownable {
    mapping(address => string) linkedWallets;
    mapping(string => address) linkedUsers;

    function linkWallet(address _walletAddress, string memory _userId)
        public
        onlyOwner
    {
        require(_walletAddress != address(0), "Wallet Address should be valid");
        require(bytes(_userId).length > 0, "UserId should not empty");
        require(
            bytes(linkedWallets[_walletAddress]).length == 0,
            "Wallet Address is already linked to another UserId"
        );
        require(
            linkedUsers[_userId] == address(0),
            "UserId is already linked to another Wallet Address"
        );
        linkedWallets[_walletAddress] = _userId;
        linkedUsers[_userId] = _walletAddress;
    }

    function getUserIdByWalletAddress(address _walletAddress)
        public
        view
        returns (string memory)
    {
        return linkedWallets[_walletAddress];
    }

    function getWalletAddressByUserId(string memory _userId)
        public
        view
        returns (address)
    {
        return linkedUsers[_userId];
    }
}
