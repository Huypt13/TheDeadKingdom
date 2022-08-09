const Web3 = require("web3");

const MarketPlaceItemService = require('../api/marketPlaceItem/MarketPlaceItem.Service');


const MarketPlaceItem = require('../api/marketPlaceItem/MarketPlaceItem.Service');


const TankUserService = require('../api/hero/TankUser.service');

const TankNFT = require('../../../Contract/demo-client/contracts/TankNFT.json');


const Database = require("../../src/api/database/Database");
const BoxService = require("../api/Box/Box.service")

const init = async () => {
    const web3 = new Web3('ws://127.0.0.1:7545');
    const networkId = await web3.eth.net.getId();
    const accounts = await web3.eth.getAccounts();
    const tankNFTContract = new web3.eth.Contract(TankNFT.abi, TankNFT.networks[networkId].address);
    const marketplaceContract = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address);
        tankNFTContract.events.BoxSold({})
        .on('data', async function (event) {
            console.log("===============BoxSold=================");
            // console.log(event.returnValues);
            const {listTokenId, tokenOwner, boxId} = event.returnValues;
            const newBox = await TankUserService.createTankUser(listTokenId, tokenOwner, boxId);
            console.log(newBox);
        })
        .on('error', console.error);


        // event NFTListed(
        //     uint256 marketItemId,
        //     address nftContract,
        //     uint256 tokenId,
        //     address seller,
        //     address buyer,
        //     uint256 price
        // );

    marketplaceContract.events.NFTListed({})
        .on('data', async function (event) {
            console.log("===============NFTListed=================");
            console.log(event.returnValues);
            MarketPlaceItemService.createAfterListed(event.returnValues);
   
        })
        .on('error', console.error);

    marketplaceContract.events.NFTSaleCanceled({})
        .on('data', async function (event) {
            console.log("===============NFTSaleCanceled=================");
            console.log(event.returnValues);
            MarketPlaceItemService.updateAfterSellCanceled(event.returnValues);

        })
        .on('error', console.error);

    marketplaceContract.events.NFTSold({})
        .on('data', async function (event) {
            console.log("===============NFTSold=================");
            console.log(event.returnValues);
            MarketPlaceItemService.updateAfterSold(event.returnValues);
        })
        .on('error', console.error);

}

module.exports = {init}




