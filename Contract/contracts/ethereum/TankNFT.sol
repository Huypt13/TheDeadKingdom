// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./ILinkWallet.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TankNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address public marketAddress;
    IERC20 public deathKingdomCoin;
    ILinkWallet public linkWallet;
    mapping(string => uint256) boxPrices;

    string public baseURI;

    constructor(
        address _marketplaceContract,
        address _deathKingdomCoinContract,
        address _linkWalletAddress
    ) ERC721("TankNFTToken", "DKT") {
        marketAddress = _marketplaceContract;
        deathKingdomCoin = IERC20(_deathKingdomCoinContract);
        linkWallet = ILinkWallet(_linkWalletAddress);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory _baseURI) public onlyOwner {
        baseURI = _baseURI;
    }

    function setBoxPrice(string memory _boxId, uint256 _price)
        public
        onlyOwner
    {
        require(bytes(_boxId).length > 0, "BoxId should not empty");
        boxPrices[_boxId] = _price;
    }

    function getBoxPrice(string memory _boxId) public view returns (uint256) {
        require(bytes(_boxId).length > 0, "BoxId should not empty");
        return boxPrices[_boxId];
    }

    event BoxSold(uint256[] listTokenId, address tokenOwner, string boxId);

    function buyBoxes(string memory _boxId, uint256 _amount)
        public
        returns (uint256[] memory)
    {
        require(
            bytes(linkWallet.getUserIdByWalletAddress(msg.sender)).length > 0,
            "Wallet Address must be linked with user account before buyBoxes"
        );
        require(bytes(_boxId).length > 0, "BoxId should not empty");
        require(boxPrices[_boxId] > 0, "Box should be selling");
        require(_amount > 0, "BoxAmount should be > 0");
        uint256 totalPrice = _amount * boxPrices[_boxId];

        uint256 senderBalance = deathKingdomCoin.balanceOf(msg.sender);
        require(
            senderBalance >= totalPrice,
            "You do not have enough DKC to buy Boxes"
        );

        uint256 allowance = deathKingdomCoin.allowance(
            msg.sender,
            address(this)
        );
        require(
            allowance >= totalPrice,
            "You do not approve enough DKC to buy Boxes"
        );

        deathKingdomCoin.transferFrom(msg.sender, owner(), totalPrice);

        uint256[] memory nfts = new uint256[](_amount);
        for (uint256 i = 0; i < _amount; i++) {
            nfts[i] = createToken();
        }
        emit BoxSold(nfts, msg.sender, _boxId);
        return nfts;
    }

    function createToken() private returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        _setApprovalForAll(_msgSender(), marketAddress, true);
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
