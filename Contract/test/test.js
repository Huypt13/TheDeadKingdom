const DeathKingdomCoin = artifacts.require("DeathKingdomCoin");
const Marketplace = artifacts.require("Marketplace");
const TankNFT = artifacts.require("TankNFT");
const BigNumber = require("big-number");

contract("Marketplace", (accounts) => {
  let marketplace;
  let tankNFT;
  let deathKingdomCoin;
  beforeEach(async () => {
    marketplace = await Marketplace.deployed();
    tankNFT = await TankNFT.deployed();
    deathKingdomCoin = await DeathKingdomCoin.deployed();
  });
  it("Marketplace Test", async () => {
    let nft1 = await tankNFT.createToken({ from: accounts[1] });
    let nft2 = await tankNFT.createToken({ from: accounts[1] });

    console.log(nft1.toString());
  });
});
