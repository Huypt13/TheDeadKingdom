const DeathKingdomCoin = artifacts.require("DeathKingdomCoin");
const Marketplace = artifacts.require("Marketplace");
const TankNFT = artifacts.require("TankNFT");

contract('Marketplace', (accounts) => {
    console.log(accounts);
    // console.log("========================" + mkp.address);

    it("test text", async () => {
        const marketplace = await Marketplace.deployed();
        const tankNFT = await TankNFT.deployed();
        const deathKingdomCoin = await DeathKingdomCoin.deployed();

        console.log(deathKingdomCoin.balanceOf(accounts[0]));

        assert.equal(deathKingdomCoin.balanceOf.call(accounts[0]), 1000000000000000000 * 100000000, "Start balance");
    })
})





