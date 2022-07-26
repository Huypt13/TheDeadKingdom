// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TankNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address public marketAddress;
    ERC20 public deathKingdomCoin;
    uint256 public boxPrice;

    constructor(address _mrketplaceContract, address _deathKingdomCoinContract)
        ERC721("TankNFTToken", "DKT")
    {
        marketAddress = _mrketplaceContract;
        deathKingdomCoin = ERC20(_deathKingdomCoinContract);
        boxPrice = 200 * 10**deathKingdomCoin.decimals();
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://api.thedeathkingdom.com/metadata/";
    }

    event NFTMinted(uint256 tokenId, address tokenOwner);

    function buyBoxes(uint256 _amount) public returns (uint256[] memory) {
        require(_amount > 0, "BoxAmount must > 0");
        uint256 totalPrice = _amount * boxPrice;

        uint256 allowance = deathKingdomCoin.allowance(
            msg.sender,
            address(this)
        );
        require(
            allowance >= totalPrice,
            "You do not have enough DKC to buy Boxes"
        );

        deathKingdomCoin.transferFrom(msg.sender, owner(), totalPrice);

        uint256[] memory nfts = new uint256[](_amount);
        for (uint256 i = 0; i < _amount; i++) {
            nfts[i] = createToken();
        }
        return nfts;
    }

    function createToken() private returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        _setApprovalForAll(_msgSender(), marketAddress, true);

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
