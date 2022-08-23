import Web3 from 'web3';
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'
import BigNumber from 'big-number'

import DeathKingdomCoin from '../contracts/DeathKingdomCoin.json'
import TankNFT from '../contracts/TankNFT.json'
import Marketplace from '../contracts/Marketplace.json'

export default function MyAssets() {
    const [nfts, setNfts] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    const router = useRouter()

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

        const data = await tankNFTContract.methods.getMyNfts(accounts[0]).call({ from: accounts[0] })

        const nfts = await Promise.all(data.map(async i => {
            try {
                const tokenURI = await tankNFTContract.methods.tokenURI(i).call()
                // const meta = await axios.get(tokenURI)
                let nft = {
                    tokenId: i,
                    image: "https://api.memeland.com/image/270.gif",
                    name: "Tank#" + i,
                    description: "TankDes#" + i,
                    tokenURI: tokenURI
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

    function listNFT(nft) {
        router.push(`/resell-nft?id=${nft.tokenId}&tokenURI=${nft.tokenURI}`)
    }

    async function sellNFT(tokenId, price = 101) {
        await setWeb3Value();

        await marketplaceContract.methods.listNft(TankNFT.networks[networkId].address, tokenId, Web3.utils.toWei(price.toString(), "ether")).send({ from: accounts[0] })
            .on('receipt', function (receipt) {
                console.log(receipt.status);
                console.log(receipt.events);
            });
    }

    if (loadingState === 'loaded' && !nfts.length) {
        return (<h1 className="py-10 px-20 text-3xl">No NFTs owned</h1>);
    } else {
        return (
            <div className="flex justify-center">
                <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                        {
                            nfts.map((nft, i) => (
                                <div key={i} className="border shadow rounded-xl overflow-hidden">
                                    <img src={nft.image} className="rounded" />
                                    <div className="p-4">
                                        <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                                        <div style={{ height: '70px', overflow: 'hidden' }}>
                                            <p className="text-gray-400">{nft.description}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-black">
                                        <p className="text-2xl font-bold text-white">URI - {nft.tokenURI}</p>
                                        <button className="mt-4 w-full bg-teal-400 text-white font-bold py-2 px-12 rounded" onClick={() => sellNFT(nft.tokenId)}>Sell {nft.name}</button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        );
    }
}