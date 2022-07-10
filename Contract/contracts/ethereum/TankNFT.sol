// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TankNFT is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address contractAddress;

    constructor(address NFTMarket) ERC721("TankNFTToken", "DKT") {
        contractAddress = NFTMarket;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://api.thedeathkingdom.com/metadata/";
    }

    event NFTMinted(uint256 tokenId, address tokenOwner);

    function createToken() public returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        _setApprovalForAll(_msgSender(), contractAddress, true);

        emit NFTMinted(newTokenId, msg.sender);
        return newTokenId;
    }

    function getMyNfts(address _ownerAddress)
        public
        view
        returns (uint256[] memory)
    {
        uint256 nftCount = _tokenIds.current();
        uint256[] memory nfts = new uint256[](balanceOf(_ownerAddress));
        uint256 nftIndex = 0;
        for (uint256 i = 0; i < nftCount; i++) {
            if (ownerOf(i + 1) == _ownerAddress) {
                nfts[nftIndex] = i + 1;
                nftIndex++;
            }
        }
        return nfts;
    }
}
