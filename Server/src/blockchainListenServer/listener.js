const Web3 = require("web3");

const MarketPlaceItemService = require("../api/marketPlaceItem/MarketPlaceItem.Service");

const MarketPlaceItem = require("../api/marketPlaceItem/MarketPlaceItem.Service");

const TankUserService = require("../api/hero/TankUser.service");

const TankNFT = require("../../../Contract/demo-client/contracts/TankNFT.json");
const Marketplace = require("../../../Contract/demo-client/contracts/Marketplace.json");
const DeathKingdomCoin = require("../../../Contract/demo-client/contracts/DeathKingdomCoin.json");

const Database = require("../../src/api/database/Database");
const BoxService = require("../api/box/Box.service");

const init = async () => {
  // const web3 = new Web3("ws://127.0.0.1:7545");
  const web3 = new Web3(
    "wss://rinkeby.infura.io/ws/v3/fe3e4b587cc84ddb8f281f9bfdf3df6c"
  );
  const networkId = await web3.eth.net.getId();

  console.log("networkId" + networkId);
  const accounts = await web3.eth.getAccounts();
  const tankNFTContract = new web3.eth.Contract(
    TankNFT.abi,
    TankNFT.networks[networkId].address
  );
  const marketplaceContract = new web3.eth.Contract(
    Marketplace.abi,
    Marketplace.networks[networkId].address
  );
  tankNFTContract.events
    .BoxSold({})
    .on("data", async function (event) {
      console.log("===============BoxSold=================");
      console.log("create", event.returnValues);
      const { listTokenId, tokenOwner, boxId } = event.returnValues;
      const newBox = await TankUserService.createTankUser(
        listTokenId,
        tokenOwner.toLowerCase(),
        boxId
      );
    })
    .on("error", console.error);

  // Web3.utils.toWei("1", "ether") => 10^18
  // Web3.utils.fromWei("10^18", "ether") => 1

  // event NFTListed(
  //     uint256 marketItemId,
  //     address nftContract,
  //     uint256 tokenId,
  //     address seller,
  //     address buyer,
  //     uint256 price
  // );

  marketplaceContract.events
    .NFTListed({})
    .on("data", async function (event) {
      console.log("===============NFTListed=================");
      console.log(event.returnValues);
      event.returnValues.nftContract =
        event.returnValues.nftContract.toLowerCase();
      event.returnValues.seller = event.returnValues.seller.toLowerCase();
      event.returnValues.buyer = event.returnValues.buyer.toLowerCase();
      MarketPlaceItemService.createAfterListed(event.returnValues);
    })
    .on("error", console.error);

  marketplaceContract.events
    .NFTSaleCanceled({})
    .on("data", async function (event) {
      console.log("===============NFTSaleCanceled=================");
      console.log(event.returnValues);
      event.returnValues.nftContract =
        event.returnValues.nftContract.toLowerCase();
      event.returnValues.seller = event.returnValues.seller.toLowerCase();
      event.returnValues.buyer = event.returnValues.buyer.toLowerCase();
      MarketPlaceItemService.updateAfterSellCanceled(event.returnValues);
    })
    .on("error", console.error);

  marketplaceContract.events
    .NFTSold({})
    .on("data", async function (event) {
      console.log("===============NFTSold=================");
      console.log(event.returnValues);
      event.returnValues.nftContract =
        event.returnValues.nftContract.toLowerCase();
      event.returnValues.seller = event.returnValues.seller.toLowerCase();
      event.returnValues.buyer = event.returnValues.buyer.toLowerCase();
      MarketPlaceItemService.updateAfterSold(event.returnValues);
    })
    .on("error", console.error);

  setInterval(async () => {
    console.log(new Date() + ": " + (await web3.eth.net.isListening()));
  }, 150000);
};

module.exports = { init };
