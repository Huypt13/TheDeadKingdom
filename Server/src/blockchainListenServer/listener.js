const Web3 = require("web3");
const TankNFT = require('../../../Contract/demo-client/contracts/TankNFT.json');
const Marketplace = require('../../../Contract/demo-client/contracts/Marketplace.json');

const init = async () => {
    const web3 = new Web3('ws://127.0.0.1:7545');
    const networkId = await web3.eth.net.getId();
    const accounts = await web3.eth.getAccounts();
    const tankNFTContract = new web3.eth.Contract(TankNFT.abi, TankNFT.networks[networkId].address);
    const marketplaceContract = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address);

    tankNFTContract.events.NFTMinted({})
        .on('data', async function (event) {
            console.log("===============NFTMinted=================");
            console.log(event.returnValues);
            // Do something here

        })
        .on('error', console.error);

    tankNFTContract.events.Transfer({})
        .on('data', async function (event) {
            console.log("===============TransferNFT=================");
            console.log(event.returnValues);
            // Phai check xem la from va to co phai cua marketplace hay khong

        })
        .on('error', console.error);

    marketplaceContract.events.NFTListed({})
        .on('data', async function (event) {
            console.log("===============NFTListed=================");
            console.log(event.returnValues);
            // Do something here
        })
        .on('error', console.error);

    marketplaceContract.events.NFTSaleCanceled({})
        .on('data', async function (event) {
            console.log("===============NFTSaleCanceled=================");
            console.log(event.returnValues);
            // Do something here
        })
        .on('error', console.error);

    marketplaceContract.events.NFTSold({})
        .on('data', async function (event) {
            console.log("===============NFTSold=================");
            console.log(event.returnValues);
            // Do something here
        })
        .on('error', console.error);

}

init();





