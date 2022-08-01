import Web3 from 'web3';
import Web3Modal from 'web3modal';
import { useEffect, useState } from 'react';
import axios from 'axios';

import DeathKingdomCoin from '../contracts/DeathKingdomCoin.json'
import TankNFT from '../contracts/TankNFT.json'
import Marketplace from '../contracts/Marketplace.json'
import BigNumber from 'big-number'

export default function Home() {
    const [nfts, setNfts] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')

    useEffect(() => { loadNFTs() }, [])
    var web3;
    var networkId;
    var accounts;
    var deathKingdomCoinContract;
    var tankNFTContract;
    var marketplaceContract;

    async function setWeb3Value() {
        const web3Modal = new Web3Modal();
        const provider = await web3Modal.connect();

        web3 = new Web3(provider);

        // web3 = new Web3('HTTP://127.0.0.1:7545');

        networkId = await web3.eth.net.getId();
        accounts = await web3.eth.getAccounts();
        deathKingdomCoinContract = new web3.eth.Contract(DeathKingdomCoin.abi, DeathKingdomCoin.networks[networkId].address);
        tankNFTContract = new web3.eth.Contract(TankNFT.abi, TankNFT.networks[networkId].address);
        marketplaceContract = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address);
    }

    async function loadNFTs() {
        await setWeb3Value();

        const listings = await marketplaceContract.methods.getListingNfts().call()
        // Iterate over the listed NFTs and retrieve their metadata
        const nfts = await Promise.all(listings.map(async (i) => {
            try {
                const tokenURI = await tankNFTContract.methods.tokenURI(i.tokenId).call()
                // const meta = await axios.get("https://api.memeland.com/metadata/270")
                const nft = {
                    marketItemId: i.marketItemId,
                    price: i.price,
                    tokenId: i.tokenId,
                    seller: i.seller,
                    owner: i.buyer,
                    image: "https://api.memeland.com/image/270.gif",
                    name: "Tank#" + i.tokenId,
                    description: "TankDes#" + i.tokenId,
                }
                return nft
            } catch (err) {
                console.log(err)
                return null
            }
        }))
        setNfts(nfts.filter(nft => nft !== null))
        setLoadingState('loaded')
    }

    async function buyNft(nftMarketItemId) {
        await setWeb3Value();

        let allowance = await deathKingdomCoinContract.methods.allowance(accounts[0], Marketplace.networks[networkId].address).call({ from: accounts[0] })

        console.log(BigNumber(nftMarketItemId.price), BigNumber(allowance));

        if (BigNumber(allowance).lt(BigNumber(nftMarketItemId.price))) {
            await deathKingdomCoinContract.methods.approve(Marketplace.networks[networkId].address, BigNumber(nftMarketItemId.price).minus(BigNumber(allowance))).send({ from: accounts[0] })
                .on('receipt', function (receipt) {
                    console.log("Approve: " + receipt.status);
                });
        }

        await marketplaceContract.methods.buyNft(nftMarketItemId.marketItemId).send({ from: accounts[0] })
            .on('receipt', function (receipt) {
                console.log(receipt);
            });

        loadNFTs()
    }

    if (loadingState === 'loaded' && !nfts.length) {
        return (<h1 className="px-20 py-10 text-3xl">No tanks on Marketplace!</h1>)
    } else {
        return (
            <div className="flex justify-center">
                <div className="px-4" style={{ maxWidth: '1600px' }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                        {
                            nfts.map((nft, i) => (
                                <div key={i} className="border shadow rounded-xl overflow-hidden">
                                    <img src={nft.image} />
                                    <div className="p-4">
                                        <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                                        <div style={{ height: '70px', overflow: 'hidden' }}>
                                            <p className="text-gray-400">{nft.description}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-black">
                                        <p className="text-2xl font-bold text-white">{Web3.utils.fromWei(nft.price, "ether")} DKC</p>
                                        <button className="mt-4 w-full bg-teal-400 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy Market Item # {nft.marketItemId}</button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        )
    }
}