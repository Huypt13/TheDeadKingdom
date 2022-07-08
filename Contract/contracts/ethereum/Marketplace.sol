// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _marketItemIds;
    Counters.Counter private _nftSold;
    IERC20 public tokenAddress;
    uint256 public platformFee = 25;
    uint256 public deno = 1000;

    address payable marketOwner;

    mapping(uint256 => NFTMarketItem) private marketItems;

    constructor(address _tokenAddress) {
        marketOwner = payable(msg.sender);
        tokenAddress = IERC20(_tokenAddress);
    }

    struct NFTMarketItem {
        uint256 marketItemId;
        uint256 tokenId;
        uint256 price;
        address payable seller;
        address payable buyer;
        address nftContract;
        bool isSelling;
    }

    event NFTListed(
        uint256 marketItemId,
        address nftContract,
        uint256 tokenId,
        address seller,
        address buyer,
        uint256 price
    );

    event NFTSaleCanceled(
        uint256 marketItemId,
        address nftContract,
        uint256 tokenId,
        address seller,
        address buyer,
        uint256 price
    );

    event NFTSold(
        uint256 marketItemId,
        address nftContract,
        uint256 tokenId,
        address seller,
        address buyer,
        uint256 price
    );

    function listNft(
        address _nftContract,
        uint256 _tokenId,
        uint256 _price
    ) public {
        require(_price > 0);
        _marketItemIds.increment();
        uint256 marketItemId = _marketItemIds.current();

        marketItems[marketItemId] = NFTMarketItem(
            marketItemId,
            _tokenId,
            _price,
            payable(msg.sender),
            payable(address(0)),
            _nftContract,
            true
        );
        IERC721(_nftContract).transferFrom(msg.sender, address(this), _tokenId);
        emit NFTListed(
            marketItemId,
            _nftContract,
            _tokenId,
            msg.sender,
            address(this),
            _price
        );
    }

    function cancelSellNft(uint256 _marketItemId) public {
        NFTMarketItem storage nftMarketItem = marketItems[_marketItemId];
        require(msg.sender == nftMarketItem.seller);
        nftMarketItem.isSelling = false;
        IERC721(nftMarketItem.nftContract).transferFrom(
            address(this),
            msg.sender,
            nftMarketItem.tokenId
        );
        emit NFTSaleCanceled(
            nftMarketItem.marketItemId,
            nftMarketItem.nftContract,
            nftMarketItem.tokenId,
            nftMarketItem.seller,
            nftMarketItem.buyer,
            nftMarketItem.price
        );
    }

    function buyNft(uint256 _marketItemId) public payable {
        NFTMarketItem storage nftMarketItem = marketItems[_marketItemId];
        uint256 price = nftMarketItem.price;
        uint256 marketFee = (price * platformFee) / deno;

        tokenAddress.transferFrom(msg.sender, address(this), price);
        // tokenAddress.transferFrom(msg.sender, address(this), marketFee);
        tokenAddress.transferFrom(msg.sender, marketOwner, marketFee);
        tokenAddress.transferFrom(
            address(this),
            nftMarketItem.seller,
            price - marketFee
        );

        nftMarketItem.buyer = payable(msg.sender);
        _nftSold.increment();

        IERC721(nftMarketItem.nftContract).transferFrom(
            address(this),
            msg.sender,
            _marketItemId
        );

        nftMarketItem.isSelling = false;
        nftMarketItem.buyer = payable(msg.sender);

        emit NFTSold(
            nftMarketItem.marketItemId,
            nftMarketItem.nftContract,
            nftMarketItem.tokenId,
            nftMarketItem.seller,
            nftMarketItem.buyer,
            price
        );
    }

    function getListingNfts() public view returns (NFTMarketItem[] memory) {
        uint256 nftCount = _marketItemIds.current();
        uint256 unsoldNftsCount = nftCount - _nftSold.current();

        NFTMarketItem[] memory nfts = new NFTMarketItem[](unsoldNftsCount);
        uint256 nftsIndex = 0;
        for (uint256 i = 0; i < nftCount; i++) {
            if (marketItems[i + 1].isSelling) {
                nfts[nftsIndex] = marketItems[i + 1];
                nftsIndex++;
            }
        }
        return nfts;
    }

    function getMyListingNfts() public view returns (NFTMarketItem[] memory) {
        uint256 nftCount = _marketItemIds.current();
        uint256 myListingNftCount = 0;
        for (uint256 i = 0; i < nftCount; i++) {
            if (
                marketItems[i + 1].seller == msg.sender &&
                marketItems[i + 1].isSelling
            ) {
                myListingNftCount++;
            }
        }

        NFTMarketItem[] memory nfts = new NFTMarketItem[](myListingNftCount);
        uint256 nftsIndex = 0;
        for (uint256 i = 0; i < nftCount; i++) {
            if (
                marketItems[i + 1].seller == msg.sender &&
                marketItems[i + 1].isSelling
            ) {
                nfts[nftsIndex] = marketItems[i + 1];
                nftsIndex++;
            }
        }
        return nfts;
    }
}
