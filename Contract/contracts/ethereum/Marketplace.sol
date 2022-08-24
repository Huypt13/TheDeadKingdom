// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./ILinkWallet.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Marketplace is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _marketItemIds;
    Counters.Counter private _nftSold;
    IERC20 public deathKingdomCoin;
    ILinkWallet public linkWallet;
    uint256 public platformFee = 25;
    uint256 public deno = 1000;

    mapping(uint256 => NFTMarketItem) private marketItems;

    constructor(address _deathKingdomCoinContract, address _linkWalletAddress) {
        deathKingdomCoin = IERC20(_deathKingdomCoinContract);
        linkWallet = ILinkWallet(_linkWalletAddress);
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

    modifier marketplaceItemExist(uint256 _marketplaceItemId) {
        require(_marketplaceItemId > 0, "MarketItemId should be > 0");
        require(
            _marketplaceItemId <= _marketItemIds.current(),
            "MarketItemId should be exist"
        );
        _;
    }

    function listNft(
        address _nftContract,
        uint256 _tokenId,
        uint256 _price
    ) public {
        require(
            bytes(linkWallet.getUserIdByWalletAddress(msg.sender)).length > 0,
            "Wallet Address must be linked with user account before listNft"
        );
        require(_price > 0, "Price must > 0");
        require(
            IERC721(_nftContract).ownerOf(_tokenId) == msg.sender,
            "You are not NFT's owner"
        );
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

    function cancelSellNft(uint256 _marketItemId)
        public
        marketplaceItemExist(_marketItemId)
    {
        NFTMarketItem storage nftMarketItem = marketItems[_marketItemId];
        require(msg.sender == nftMarketItem.seller, "You are not NFT's Owner");
        require(nftMarketItem.isSelling == true, "NFT is not Selling");
        nftMarketItem.isSelling = false;
        IERC721(nftMarketItem.nftContract).transferFrom(
            address(this),
            msg.sender,
            nftMarketItem.tokenId
        );
        _nftSold.increment();
        emit NFTSaleCanceled(
            nftMarketItem.marketItemId,
            nftMarketItem.nftContract,
            nftMarketItem.tokenId,
            nftMarketItem.seller,
            nftMarketItem.buyer,
            nftMarketItem.price
        );
    }

    function buyNft(uint256 _marketItemId)
        public
        payable
        marketplaceItemExist(_marketItemId)
    {
        require(
            bytes(linkWallet.getUserIdByWalletAddress(msg.sender)).length > 0,
            "Wallet Address must be linked with user account before buyNft"
        );
        NFTMarketItem storage nftMarketItem = marketItems[_marketItemId];
        require(nftMarketItem.isSelling == true, "NFT is not Selling");
        require(
            nftMarketItem.seller != msg.sender,
            "You can not buy your own NFT"
        );

        uint256 price = nftMarketItem.price;
        uint256 marketFee = (price * platformFee) / deno;

        uint256 senderBalance = deathKingdomCoin.balanceOf(msg.sender);
        require(
            senderBalance >= price,
            "You do not have enough DKC to buy this NFT"
        );

        uint256 allowance = deathKingdomCoin.allowance(
            msg.sender,
            address(this)
        );
        require(
            allowance >= price,
            "You do not approve enough DKC to buy this NFT"
        );

        deathKingdomCoin.transferFrom(msg.sender, address(this), price);

        deathKingdomCoin.transfer(nftMarketItem.seller, price - marketFee);

        deathKingdomCoin.transfer(
            owner(),
            deathKingdomCoin.balanceOf(address(this))
        );

        nftMarketItem.buyer = payable(msg.sender);
        _nftSold.increment();

        IERC721(nftMarketItem.nftContract).transferFrom(
            address(this),
            msg.sender,
            nftMarketItem.tokenId
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

    function getMarketItem(uint256 _marketItemId)
        public
        view
        marketplaceItemExist(_marketItemId)
        returns (NFTMarketItem memory)
    {
        return marketItems[_marketItemId];
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

    function getNftSellHistory(uint256 _tokenId)
        public
        view
        returns (NFTMarketItem[] memory)
    {
        uint256 nftCount = _marketItemIds.current();
        uint256 nftSellHistoryCount = 0;
        for (uint256 i = 0; i < nftCount; i++) {
            if (
                marketItems[i + 1].tokenId == _tokenId &&
                !marketItems[i + 1].isSelling
            ) {
                nftSellHistoryCount++;
            }
        }

        NFTMarketItem[] memory nfts = new NFTMarketItem[](nftSellHistoryCount);
        uint256 nftsIndex = 0;
        for (uint256 i = 0; i < nftCount; i++) {
            if (
                marketItems[i + 1].tokenId == _tokenId &&
                !marketItems[i + 1].isSelling
            ) {
                nfts[nftsIndex] = marketItems[i + 1];
                nftsIndex++;
            }
        }
        return nfts;
    }
}
