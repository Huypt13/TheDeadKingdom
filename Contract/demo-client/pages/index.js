import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Web3 from 'web3'
import Web3Modal from 'web3modal'
import DeathKingdomCoin from '../contracts/DeathKingdomCoin.json'
import TankNFT from '../contracts/TankNFT.json'
import Marketplace from '../contracts/Marketplace.json'
import BigNumber from 'big-number'
import { useEffect, useState } from 'react';

export default function Home() {
  var web3;
  var networkId;
  var accounts;
  var deathKingdomCoinContract;
  var tankNFTContract;
  var marketplaceContract;

  const [boxAmount, setBoxAmount] = useState(1);

  async function setWeb3Value() {

    const web3Modal = new Web3Modal();
    const provider = await web3Modal.connect();

    // console.log(provider)
    // console.log(window.ethereum)
    // console.log(window.ethereum == provider)
    web3 = new Web3(provider);

    // web3 = new Web3('HTTP://127.0.0.1:7545');

    networkId = await web3.eth.net.getId();
    accounts = await web3.eth.getAccounts();
    deathKingdomCoinContract = new web3.eth.Contract(DeathKingdomCoin.abi, DeathKingdomCoin.networks[networkId].address);
    tankNFTContract = new web3.eth.Contract(TankNFT.abi, TankNFT.networks[networkId].address);
    marketplaceContract = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address);
    console.log("DKC Address:  " + DeathKingdomCoin.networks[networkId].address)
    console.log("TankNFT Address:  " + TankNFT.networks[networkId].address)

  }

  setWeb3Value();

  async function buyBoxes() {
    const amount = boxAmount;
    const boxPrice = (await tankNFTContract.methods.getBoxPrice("62f20d4b70d1f15ecd11c37a").call({ from: accounts[0] }));

    let allowance = await deathKingdomCoinContract.methods.allowance(accounts[0], TankNFT.networks[networkId].address).call({ from: accounts[0] })

    console.log((boxPrice), (allowance));

    if (BigNumber(allowance).lt(BigNumber(boxPrice).mult(amount))) {
      await deathKingdomCoinContract.methods.approve(TankNFT.networks[networkId].address, (BigNumber(boxPrice).mult(amount))).send({ from: accounts[0] })
        .on('receipt', function (receipt) {
          console.log("Approve: " + receipt.status);
        });
    }

    await tankNFTContract.methods.buyBoxes("62f20d4b70d1f15ecd11c37a",amount).send({ from: accounts[0] })
      .on('receipt', function (receipt) {
        console.log(receipt.status);
        console.log(receipt.events);
        console.log(receipt.events.NFTMinted.returnValues);
      });
  }

  async function widthdrawal(amount = 1000) {
    const address = "0xCF7ffDb02C8219f4725a9B08cf244d941E30ee78";
    const privateKey = "c57cfcb34e77aaf9a4d7d85dc5ecacd0f7cbef707c167b9a1374497743737860";

    web3.eth.accounts.wallet.add(privateKey);

    const tx = deathKingdomCoinContract.methods.transfer(accounts[0], Web3.utils.toWei(amount.toString(), "ether"));
    const gas = await tx.estimateGas({ from: address });
    const gasPrice = await web3.eth.getGasPrice();
    const data = tx.encodeABI();
    const nonce = await web3.eth.getTransactionCount(address);
    const txData = {
      from: address,
      to: deathKingdomCoinContract.options.address,
      data: data,
      gas,
      gasPrice,
      nonce,
      // chain: 'rinkeby',
      // hardfork: 'istanbul'
    };

    const receipt = await web3.eth.sendTransaction(txData);

    console.log(receipt);
  }

  async function getBalance() {
    let balance = await deathKingdomCoinContract.methods.balanceOf(accounts[0]).call({ from: accounts[0] });

    console.log(balance, typeof (balance));
  }

  async function getListingNfts() {
    const listings = await marketplaceContract.methods.getListingNfts().call();
    console.log(listings);
  }


  async function getMyNfts() {
    const myNfts = await tankNFTContract.methods.getMyNfts(accounts[0]).call();
    console.log(myNfts);
  }

  async function getMyListingNfts() {
    const myNfts = await marketplaceContract.methods.getMyListingNfts().call({ from: accounts[0] });
    console.log(myNfts);
  }

  async function setBoxPrice(){
    const address = "0xA338b617517AFF6ca572B0D5Be5A64b64DabCA2d";
    const privateKey =
      "c5da068700edd9097b7a4ad79db5bd61021b9ecef75f112c01e3e1d9272dee92";

    web3.eth.accounts.wallet.add(privateKey);

    const tx = tankNFTContract.methods.setBoxPrice(
      "62f20d4b70d1f15ecd11c37a",
      Web3.utils.toWei("100", "ether")
    );
    const gas = await tx.estimateGas({ from: address });
    const gasPrice = await web3.eth.getGasPrice();
    const data = tx.encodeABI();
    const nonce = await web3.eth.getTransactionCount(address);
    const txData = {
      from: address,
      to: tankNFTContract.options.address,
      data: data,
      gas,
      gasPrice,
      nonce,
      // chain: 'rinkeby',
      // hardfork: 'istanbul'
    };

    const receipt = await web3.eth.sendTransaction(txData);
    console.log(receipt);
  }

  


  return (
    <div className={styles.container}>
      <Head>
        <title>Marketplace</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      Box Amount<input type="number" min="1" name="boxAmount" className='w-full my-1 text-black border' value={boxAmount} onChange={(event) => { setBoxAmount(event.target.value); }} />

      <button type="button" className="mt-4 w-full bg-teal-400 text-white font-bold py-2 px-12 rounded" onClick={() => buyBoxes()}>BuyBoxes</button>
      <button type="button" className="mt-4 w-full bg-teal-400 text-white font-bold py-2 px-12 rounded" onClick={() => getBalance()}>GetBalance</button>
      <button type="button" className="mt-4 w-full bg-teal-400 text-white font-bold py-2 px-12 rounded" onClick={() => getMyNfts()}>getMyNfts</button>
      <button type="button" className="mt-4 w-full bg-teal-400 text-white font-bold py-2 px-12 rounded" onClick={() => getListingNfts()}>getListingNfts</button>
      <button type="button" className="mt-4 w-full bg-teal-400 text-white font-bold py-2 px-12 rounded" onClick={() => getMyListingNfts()}>getMyListingNfts</button>

      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <button type="button" className="mt-4 w-full bg-teal-400 text-white font-bold py-2 px-12 rounded" onClick={() => setBoxPrice()}>SetBoxPrice</button>
      <button type="button" className="mt-4 w-full bg-teal-400 text-white font-bold py-2 px-12 rounded" onClick={() => setWeb3Value(this)}>Connect to metamask</button>

    </div>
  )
}
