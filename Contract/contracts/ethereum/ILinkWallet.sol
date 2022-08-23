// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

interface ILinkWallet {
    function linkWallet(address _walletAddress, string memory _userId) external;

    function getUserIdByWalletAddress(address _walletAddress)
        external
        view
        returns (string memory);

    function getWalletAddressByUserId(string memory _userId)
        external
        view
        returns (address);
}
