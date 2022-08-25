const TankNFT = artifacts.require("TankNFT");
const Marketplace = artifacts.require("Marketplace");
const DeathKingdomCoin = artifacts.require("DeathKingdomCoin");
const LinkWallet = artifacts.require("LinkWallet");
const Web3 = require("web3");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(LinkWallet, { from: accounts[0] });
  const linkWallet = await LinkWallet.deployed();
  await deployer.deploy(DeathKingdomCoin, { from: accounts[0] });
  const deathKingdomCoin = await DeathKingdomCoin.deployed();
  await deployer.deploy(Marketplace, deathKingdomCoin.address, linkWallet.address, { from: accounts[0] });
  const marketplace = await Marketplace.deployed();
  await deployer.deploy(TankNFT, marketplace.address, deathKingdomCoin.address, linkWallet.address, { from: accounts[0] });

  const tankNFT = await TankNFT.deployed();
  await tankNFT.setBoxPrice("62f20d4b70d1f15ecd11c37a", Web3.utils.toWei("200", "ether"), { from: accounts[0] });

};
