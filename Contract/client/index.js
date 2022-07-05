const Web3 = require("Web3");
const DeathKingdomCoin = require('./contracts/DeathKingdomCoin.json');

const init = async () => {
    const web3 = new Web3('HTTP://127.0.0.1:7545');
    const networkId = await web3.eth.net.getId()
    const accounts = await web3.eth.getAccounts();
    const deathKingdomCoinContract = new web3.eth.Contract(DeathKingdomCoin.abi, DeathKingdomCoin.networks[networkId].address);

    // const contractName = await deathKingdomCoinContract.methods.name().call();

    await deathKingdomCoinContract.methods.transfer(accounts[1], 10000).send({ from: accounts[0] });

    const balance1 = await deathKingdomCoinContract.methods.balanceOf(accounts[0]).call();
    const balance2 = await deathKingdomCoinContract.methods.balanceOf(accounts[1]).call();
    console.log(balance1 + " " + balance2);

}

init();





