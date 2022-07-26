const TankNFT = artifacts.require("TankNFT");
const Marketplace = artifacts.require("Marketplace");
const DeathKingdomCoin = artifacts.require("DeathKingdomCoin");

module.exports = async function (deployer) {
  await deployer.deploy(DeathKingdomCoin);
  const deathKingdomCoin = await DeathKingdomCoin.deployed();
  await deployer.deploy(Marketplace, deathKingdomCoin.address);
  const marketplace = await Marketplace.deployed();
  await deployer.deploy(TankNFT, marketplace.address, deathKingdomCoin.address);


};
