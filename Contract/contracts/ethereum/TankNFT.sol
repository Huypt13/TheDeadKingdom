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
    mapping(uint256 => uint256) boxPrices;

    constructor(address _mrketplaceContract, address _deathKingdomCoinContract)
        ERC721("TankNFTToken", "DKT")
    {
        marketAddress = _mrketplaceContract;
        deathKingdomCoin = ERC20(_deathKingdomCoinContract);
        setBoxPrice(1, 200);
    }

    function setBoxPrice(uint256 _boxId, uint256 _price) public onlyOwner {
        require(_boxId > 0);
        require(_price > 10);
        boxPrices[_boxId] = _price * 10**deathKingdomCoin.decimals();
    }

    function _baseURI() internal pure override returns (string memory) {
        return "http://44.204.11.10:8080/metadata/";
    }

    event BoxSold(uint256[] listTokenId, address tokenOwner, uint256 boxId);

    function buyBoxes(uint256 _boxId, uint256 _amount)
        public
        returns (uint256[] memory)
    {
        require(_amount > 0, "BoxAmount must > 0");
        uint256 totalPrice = _amount * boxPrices[_boxId];

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
