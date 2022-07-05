const Web3 = require("Web3");
const TankNFT = require('./contracts/TankNFT.json');

const init = async () => {
    const web3 = new Web3('ws://127.0.0.1:7545');
    const networkId = await web3.eth.net.getId()
    const accounts = await web3.eth.getAccounts();
    const tankNFTContract = new web3.eth.Contract(TankNFT.abi, TankNFT.networks[networkId].address);

    const contractName = await tankNFTContract.methods.name().call();

    tankNFTContract.events.NFTMinted({})
        .on('data', async function (event) {
            console.log(event.returnValues);
            // Do something here
        })
        .on('error', console.error);

    await tankNFTContract.methods.createToken("tokenURI1").send({ from: accounts[0] });
}

init();





