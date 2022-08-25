const DeathKingdomCoin = artifacts.require("DeathKingdomCoin");
const Marketplace = artifacts.require("Marketplace");
const TankNFT = artifacts.require("TankNFT");
const LinkWallet = artifacts.require("LinkWallet");
// const BigNumber = require("big-number");
const Web3 = require("web3");

const toBN = Web3.utils.toBN;
const truffleAssert = require("truffle-assertions");

contract("SmartContract Testing", (accounts) => {
  let marketplace;
  let tankNFT;
  let deathKingdomCoin;
  let linkWallet;
  let boxId1 = "2316215421354612";
  let priceBoxId1 = Web3.utils.toWei("10", "ether");

  const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

  const DKCToWei = (amount) => {
    return Web3.utils.toWei(amount, "ether");
  };

  beforeEach(async () => {
    marketplace = await Marketplace.deployed();
    tankNFT = await TankNFT.deployed();
    deathKingdomCoin = await DeathKingdomCoin.deployed();
    linkWallet = await LinkWallet.deployed();
    // console.log("================================= brfore each");
    // deathKingdomCoin = await DeathKingdomCoin.new();
    // marketplace = await Marketplace.new(deathKingdomCoin.address);
    // tankNFT = await TankNFT.new(marketplace.address, deathKingdomCoin.address);
  });

  describe("Initial State", () => {
    it("Init supply should be 100000000000000000000000000", async () => {
      assert.equal(
        (await deathKingdomCoin.balanceOf(accounts[0])).toString(),
        "100000000000000000000000000"
      );
    });

    it("Transfer DKC to accounts", async () => {
      await deathKingdomCoin.transfer(
        accounts[1],
        Web3.utils.toWei("100", "ether"),
        { from: accounts[0] }
      );
      assert.equal(
        (await deathKingdomCoin.balanceOf(accounts[1])).toString(),
        Web3.utils.toWei("100", "ether")
      );
    });

    it("Transfer exceed balance error", async () => {
      await truffleAssert.reverts(
        deathKingdomCoin.transfer(accounts[1], 100, { from: accounts[2] }),
        "transfer amount exceeds balance"
      );
    });

    it("Transfer 0 DKC", async () => {
      await truffleAssert.passes(
        deathKingdomCoin.transfer(accounts[1], 0, { from: accounts[2] }),
        "passes"
      );
    });

    it("Approve for 10 DKC", async () => {
      await truffleAssert.passes(
        deathKingdomCoin.approve(accounts[1], 10, { from: accounts[2] }),
        "passes"
      );
      assert.equal(
        (await deathKingdomCoin.allowance(accounts[2], accounts[1])).toString(),
        "10"
      );
    });

    it("Approve again for 10 DKC", async () => {
      await truffleAssert.passes(
        deathKingdomCoin.approve(accounts[1], 10, { from: accounts[2] }),
        "passes"
      );
      assert.equal(
        (await deathKingdomCoin.allowance(accounts[2], accounts[1])).toString(),
        "10"
      );
    });

    it("Approve for 0 DKC", async () => {
      await truffleAssert.passes(
        deathKingdomCoin.approve(accounts[1], 0, { from: accounts[2] }),
        "passes"
      );
      assert.equal(
        (await deathKingdomCoin.allowance(accounts[2], accounts[1])).toString(),
        "0"
      );
    });

    it("Check balance of accounts when smartcontract have just deployed", async () => {
      assert.equal((await tankNFT.balanceOf(accounts[1])).toString(), "0");
      assert.equal((await tankNFT.balanceOf(accounts[2])).toString(), "0");
    });

    it("Get all Lising NFT on Marketplace when smartcontract have just deployed", async () => {
      let listingNFTs = await marketplace.getListingNfts();
      assert.equal(listingNFTs.length, 0);
    });

    it("Get Lising NFT on Marketplace of an address when smartcontract have just deployed", async () => {
      let listingNFTs = await marketplace.getMyListingNfts({
        from: accounts[1],
      });
      assert.equal(listingNFTs.length, 0);
    });

    it("Get NFT Sell History on Marketplace when smartcontract have just deployed", async () => {
      let listingNFTs = await marketplace.getNftSellHistory(1);
      assert.equal(listingNFTs.length, 0);
    });

    it("Get Box Price after deploy", async () => {
      let boxPrice = await tankNFT.getBoxPrice("62f20d4b70d1f15ecd11c37a");
      assert.equal(boxPrice.toString(), Web3.utils.toWei("200", "ether"));
    });
  });

  describe("Buy Box state", () => {
    describe("Set Box Price", () => {
      it("Set Box Price with negative price", async () => {
        await truffleAssert.fails(
          tankNFT.setBoxPrice(boxId1, -1, { from: accounts[0] }),
          "value out-of-bounds"
        );
      });

      it("Set Box Price with empty boxId", async () => {
        await truffleAssert.reverts(
          tankNFT.setBoxPrice("", priceBoxId1, { from: accounts[0] }),
          "BoxId should not empty"
        );
      });

      it("Set Box Price with with not owner address", async () => {
        await truffleAssert.reverts(
          tankNFT.setBoxPrice(boxId1, priceBoxId1, { from: accounts[1] }),
          "caller is not the owner"
        );
      });

      it("Set Box Price correctly", async () => {
        await truffleAssert.passes(
          tankNFT.setBoxPrice(boxId1, priceBoxId1, { from: accounts[0] }),
          "passes"
        );
      });

      it("Set Box Price = 0", async () => {
        await truffleAssert.passes(
          tankNFT.setBoxPrice("boxId1", 0, { from: accounts[0] }),
          "passes"
        );
      });
    });

    describe("Get Box Price", () => {
      it("Get Box Price with empty boxId", async () => {
        await truffleAssert.reverts(
          tankNFT.getBoxPrice(""),
          "BoxId should not empty"
        );
      });

      it("Get Box Price with wrong boxId", async () => {
        await truffleAssert.passes(tankNFT.getBoxPrice("wrongId"), "passes");
        let wrongBoxidPrice = await tankNFT.getBoxPrice("wrongId");
        assert.equal(wrongBoxidPrice.toString(), "0");
      });

      it("Get Box Price correctly", async () => {
        await truffleAssert.passes(tankNFT.getBoxPrice(boxId1), "passes");
        let boxid1Price = await tankNFT.getBoxPrice(boxId1);
        assert.equal(boxid1Price.toString(), priceBoxId1);
      });
    });

    describe("Buy Box", () => {
      it("Buy Box with unLink address", async () => {
        await truffleAssert.reverts(
          tankNFT.buyBoxes(boxId1, 1, { from: accounts[1] }),
          "Wallet Address must be linked with user account before buyBoxes"
        );
      });

      it("Link Wallet with empty userId", async () => {
        await truffleAssert.reverts(
          linkWallet.linkWallet(accounts[1], "", { from: accounts[0] }),
          "UserId should not empty"
        );
      });

      it("Link Wallet when caller is not owner", async () => {
        await truffleAssert.reverts(
          linkWallet.linkWallet(accounts[1], "userId1", { from: accounts[1] }),
          "caller is not the owner"
        );
      });

      it("Link Wallet", async () => {
        await truffleAssert.passes(
          linkWallet.linkWallet(accounts[1], "userId1", { from: accounts[0] }),
          "passes"
        );
      });

      it("Link Wallet again with same wallet address", async () => {
        await truffleAssert.reverts(
          linkWallet.linkWallet(accounts[1], "userId2", { from: accounts[0] }),
          "Wallet Address is already linked to another UserId"
        );
      });

      it("Buy Box with empty boxId", async () => {
        await truffleAssert.reverts(
          tankNFT.buyBoxes("", 1, { from: accounts[1] }),
          "BoxId should not empty"
        );
      });

      it("Buy Box with wrong boxId", async () => {
        await truffleAssert.reverts(
          tankNFT.buyBoxes("wrongBoxId", 0, { from: accounts[1] }),
          "Box should be selling"
        );
      });

      it("Buy Box with amount = 0", async () => {
        await truffleAssert.reverts(
          tankNFT.buyBoxes(boxId1, 0, { from: accounts[1] }),
          "BoxAmount should be > 0"
        );
      });

      it("Buy Box with amount < 0", async () => {
        await truffleAssert.fails(
          tankNFT.buyBoxes("wrongBoxId", -1, { from: accounts[1] }),
          "value out-of-bounds"
        );
      });

      it("Buy Box without allowance", async () => {
        await truffleAssert.reverts(
          tankNFT.buyBoxes(boxId1, 5, { from: accounts[1] }),
          "You do not approve enough DKC to buy Boxes"
        );
      });

      it("Check allowance at start", async () => {
        let allowance = await deathKingdomCoin.allowance(
          accounts[1],
          tankNFT.address
        );
        assert.equal(allowance.toString(), "0");
      });

      it("Approve TankNFT contract to use DKC when have DKC", async () => {
        await deathKingdomCoin.approve(tankNFT.address, priceBoxId1, {
          from: accounts[1],
        });
        let allowance = await deathKingdomCoin.allowance(
          accounts[1],
          tankNFT.address
        );
        assert.equal(allowance.toString(), priceBoxId1);
      });

      it("Approve TankNFT contract to use DKC when do not have DKC", async () => {
        await deathKingdomCoin.approve(tankNFT.address, priceBoxId1, {
          from: accounts[4],
        });
        let allowance = await deathKingdomCoin.allowance(
          accounts[4],
          tankNFT.address
        );
        assert.equal(allowance.toString(), priceBoxId1);
      });

      it("Buy Box with allowance but without DKC", async () => {
        await truffleAssert.reverts(
          linkWallet.linkWallet(accounts[4], "userId1", { from: accounts[0] }),
          "UserId is already linked to another Wallet Address"
        );

        await truffleAssert.passes(
          linkWallet.linkWallet(accounts[4], "userId4", { from: accounts[0] }),
          "passes"
        );

        await truffleAssert.reverts(
          tankNFT.buyBoxes(boxId1, 1, { from: accounts[4] }),
          "You do not have enough DKC to buy Boxes"
        );
      });

      it("Buy 1 Box correctly", async () => {
        assert.equal(
          (await deathKingdomCoin.balanceOf(accounts[1])).toString(),
          Web3.utils.toWei("100", "ether")
        );

        await truffleAssert.passes(
          tankNFT.buyBoxes(boxId1, 1, { from: accounts[1] }),
          "passes"
        );

        assert.equal((await tankNFT.balanceOf(accounts[1])).toString(), "1");
      });

      it("Check Allowance and balance after buy box", async () => {
        let allowance = await deathKingdomCoin.allowance(
          accounts[1],
          tankNFT.address
        );
        assert.equal(allowance.toString(), "0");

        assert.equal(
          (await deathKingdomCoin.balanceOf(accounts[1])).toString(),
          DKCToWei("90")
        );
      });

      it("Check owner of NFT after buy box", async () => {
        assert.equal((await tankNFT.ownerOf(1)).toString(), accounts[1]);
        assert.equal((await tankNFT.balanceOf(accounts[1])).toString(), "1");
      });

      it("Check OwnerOf tokenId < 0", async () => {
        await truffleAssert.fails(tankNFT.ownerOf(-1), "value out-of-bounds");
      });

      it("Check OwnerOf tokenId = 0", async () => {
        await truffleAssert.fails(
          tankNFT.ownerOf(0),
          "owner query for nonexistent token"
        );
      });

      it("Check OwnerOf nonexists tokenId", async () => {
        await truffleAssert.fails(
          tankNFT.ownerOf(10),
          "owner query for nonexistent token"
        );
      });

      it("Buy 2 Box correctly", async () => {
        await deathKingdomCoin.approve(tankNFT.address, DKCToWei("30"), {
          from: accounts[1],
        });
        await truffleAssert.passes(
          tankNFT.buyBoxes(boxId1, 2, { from: accounts[1] }),
          "passes"
        );

        assert.equal((await tankNFT.balanceOf(accounts[1])).toString(), "3");
      });
    });
  });

  describe("Trade on Marketplace Stage", () => {
    describe("List NFT to Marketplace", () => {
      it("List NFT with Price = 0", async () => {
        await truffleAssert.reverts(
          marketplace.listNft(tankNFT.address, 1, 0, { from: accounts[1] }),
          "Price must > 0"
        );
      });

      it("List NFT with wrong owner", async () => {
        await truffleAssert.reverts(
          marketplace.listNft(tankNFT.address, 1, 10, { from: accounts[4] }),
          "You are not NFT's owner"
        );
      });

      it("List NFT with Price < 0", async () => {
        await truffleAssert.fails(
          marketplace.listNft(tankNFT.address, 1, -1, { from: accounts[1] }),
          "value out-of-bounds"
        );
      });

      it("List NFT with nonexistent NFT", async () => {
        await truffleAssert.reverts(
          marketplace.listNft(tankNFT.address, 10, DKCToWei("10"), {
            from: accounts[1],
          }),
          "owner query for nonexistent token"
        );
      });

      it("List NFT with wrong Contract address", async () => {
        await truffleAssert.fails(
          marketplace.listNft("wrong address", 1, DKCToWei("10"), {
            from: accounts[1],
          }),
          "invalid address"
        );

        await truffleAssert.reverts(
          marketplace.listNft(deathKingdomCoin.address, 1, DKCToWei("10"), {
            from: accounts[1],
          }),
          "revert"
        );
      });

      it("List NFT correctly", async () => {
        await truffleAssert.passes(
          marketplace.listNft(tankNFT.address, 1, DKCToWei("9"), {
            from: accounts[1],
          }),
          "passes"
        );
      });

      it("Get all Lising NFT on Marketplace when account 1 list Tank 1 to Marketplace", async () => {
        let listingNFTs = await marketplace.getListingNfts();
        assert.equal(listingNFTs.length, 1);
      });

      it("Get Lising NFT on Marketplace of an address when account 1 list Tank 1 to Marketplace", async () => {
        let listingNFTs = await marketplace.getMyListingNfts({
          from: accounts[1],
        });
        assert.equal(listingNFTs.length, 1);
      });

      it("Get NFT Sell History on Marketplace when account 1 list Tank 1 to Marketplace", async () => {
        let listingNFTs = await marketplace.getNftSellHistory(1);
        assert.equal(listingNFTs.length, 0);
      });

      it("Check owner of NFT after list NFT", async () => {
        assert.equal(
          (await tankNFT.ownerOf(1)).toString(),
          marketplace.address
        );
        assert.equal((await tankNFT.balanceOf(accounts[1])).toString(), "2");
      });

      it("Check information of marketplace item", async () => {
        let marketItem = await marketplace.getMarketItem(1);
        assert.equal(marketItem.tokenId, "1");
        assert.equal(marketItem.price, DKCToWei("9"));
        assert.equal(marketItem.seller, accounts[1]);
        assert.equal(marketItem.buyer, ADDRESS_ZERO);
        assert.equal(marketItem.nftContract, tankNFT.address);
        assert.equal(marketItem.isSelling, true);
      });
    });

    describe("Cancel selling NFT on Marketplace", () => {
      it("Cancel selling NFT with MarketplaceItemId = 0", async () => {
        await truffleAssert.reverts(
          marketplace.cancelSellNft(0, { from: accounts[1] }),
          "MarketItemId should be > 0"
        );
      });

      it("Cancel selling NFT MarketplaceItemId < 0", async () => {
        await truffleAssert.fails(
          marketplace.cancelSellNft(-1, { from: accounts[1] }),
          "value out-of-bounds"
        );
      });

      it("Cancel selling NFT with nonexistent MarketplaceItemId", async () => {
        await truffleAssert.reverts(
          marketplace.cancelSellNft(10, { from: accounts[1] }),
          "MarketItemId should be exist"
        );
      });

      it("Cancel selling NFT with wrong address call to smartcontract", async () => {
        await truffleAssert.reverts(
          marketplace.cancelSellNft(1, { from: accounts[2] }),
          "You are not NFT's Owner"
        );
      });

      it("Cancel selling NFT successfully", async () => {
        await truffleAssert.passes(
          marketplace.cancelSellNft(1, { from: accounts[1] }),
          "passes"
        );
      });

      it("Cancel selling NFT with isSelling = false", async () => {
        await truffleAssert.reverts(
          marketplace.cancelSellNft(1, { from: accounts[1] }),
          "NFT is not Selling"
        );
      });

      it("Check information of marketplace item after cancel selling", async () => {
        let marketItem = await marketplace.getMarketItem(1);
        assert.equal(marketItem.tokenId, "1");
        assert.equal(marketItem.price, DKCToWei("9"));
        assert.equal(marketItem.seller, accounts[1]);
        assert.equal(marketItem.buyer, ADDRESS_ZERO);
        assert.equal(marketItem.nftContract, tankNFT.address);
        assert.equal(marketItem.isSelling, false);
      });

      it("Get all Lising NFT on Marketplace when account 1 cancel sell Tank 1 to Marketplace", async () => {
        let listingNFTs = await marketplace.getListingNfts();
        assert.equal(listingNFTs.length, 0);
      });

      it("Get Lising NFT on Marketplace of an address when account 1 cancel sell Tank 1 to Marketplace", async () => {
        let listingNFTs = await marketplace.getMyListingNfts({
          from: accounts[1],
        });
        assert.equal(listingNFTs.length, 0);
      });

      it("Get NFT Sell History on Marketplace when account 1 cancel sell Tank 1 to Marketplace", async () => {
        let listingNFTs = await marketplace.getNftSellHistory(1);
        assert.equal(listingNFTs.length, 1);
      });
    });
    describe("Buy NFT", () => {
      it("Buy NFT with MarketplaceItemId = 0", async () => {
        await truffleAssert.reverts(
          marketplace.buyNft(0, { from: accounts[1] }),
          "MarketItemId should be > 0"
        );
      });

      it("Buy NFT MarketplaceItemId < 0", async () => {
        await truffleAssert.fails(
          marketplace.buyNft(-1, { from: accounts[1] }),
          "value out-of-bounds"
        );
      });

      it("Buy NFT with nonexistent MarketplaceItemId", async () => {
        await truffleAssert.reverts(
          marketplace.buyNft(10, { from: accounts[1] }),
          "MarketItemId should be exist"
        );
      });

      it("Buy NFT with isSelling = false", async () => {
        await truffleAssert.reverts(
          marketplace.buyNft(1, { from: accounts[1] }),
          "NFT is not Selling"
        );
      });

      it("Buy your own NFT", async () => {
        await truffleAssert.passes(
          marketplace.listNft(tankNFT.address, 1, DKCToWei("8"), {
            from: accounts[1],
          }),
          "passes"
        );

        await truffleAssert.reverts(
          marketplace.buyNft(2, { from: accounts[1] }),
          "You can not buy your own NFT"
        );
      });

      it("Get all Lising NFT on Marketplace when account 1 list tank 1 again to Marketplace", async () => {
        let listingNFTs = await marketplace.getListingNfts();
        assert.equal(listingNFTs.length, 1);
      });

      it("Get Lising NFT on Marketplace of an address when account 1 list tank 1 again to Marketplace", async () => {
        let listingNFTs = await marketplace.getMyListingNfts({
          from: accounts[1],
        });
        assert.equal(listingNFTs.length, 1);
      });

      it("Get NFT Sell History on Marketplace when account 1 list tank 1 again to Marketplace", async () => {
        let listingNFTs = await marketplace.getNftSellHistory(1);
        assert.equal(listingNFTs.length, 1);
      });

      it("Buy NFT without link wallet", async () => {
        await truffleAssert.reverts(
          marketplace.buyNft(2, { from: accounts[2] }),
          "Wallet Address must be linked with user account before buyNft"
        );
      });

      it("Buy NFT without DKC", async () => {
        await truffleAssert.passes(
          linkWallet.linkWallet(accounts[2], "userId2", { from: accounts[0] }),
          "passes"
        );

        await truffleAssert.reverts(
          marketplace.buyNft(2, { from: accounts[2] }),
          "You do not have enough DKC to buy this NFT"
        );
      });

      it("Check allowance at start", async () => {
        let allowance = await deathKingdomCoin.allowance(
          accounts[2],
          marketplace.address
        );
        assert.equal(allowance.toString(), "0");
      });

      it("Buy NFT without allowance", async () => {
        await deathKingdomCoin.transfer(accounts[2], DKCToWei("10"), {
          from: accounts[0],
        });

        await truffleAssert.reverts(
          marketplace.buyNft(2, { from: accounts[2] }),
          "You do not approve enough DKC to buy this NFT"
        );
      });

      it("Approve Marketplace contract to use DKC to buy NFT", async () => {
        await deathKingdomCoin.approve(marketplace.address, DKCToWei("8"), {
          from: accounts[2],
        });
        let allowance = await deathKingdomCoin.allowance(
          accounts[2],
          marketplace.address
        );
        assert.equal(allowance.toString(), DKCToWei("8"));
      });

      it("Buy NFT correctly", async () => {
        await truffleAssert.passes(
          marketplace.buyNft(2, { from: accounts[2] }),
          "passes"
        );

        assert.equal((await tankNFT.balanceOf(accounts[1])).toString(), "2");
        assert.equal((await tankNFT.balanceOf(accounts[2])).toString(), "1");
      });

      it("Check OwnerOf Tank 1 after bought account 2", async () => {
        assert.equal((await tankNFT.ownerOf(1)).toString(), accounts[2]);
      });

      it("Check balance of accounts after account 2 buy tank 1", async () => {
        assert.equal((await tankNFT.balanceOf(accounts[1])).toString(), "2");
        assert.equal((await tankNFT.balanceOf(accounts[2])).toString(), "1");
      });

      it("Check information of marketplace item after cancel selling", async () => {
        let marketItem = await marketplace.getMarketItem(2);
        assert.equal(marketItem.tokenId, "1");
        assert.equal(marketItem.price, DKCToWei("8"));
        assert.equal(marketItem.seller, accounts[1]);
        assert.equal(marketItem.buyer, accounts[2]);
        assert.equal(marketItem.nftContract, tankNFT.address);
        assert.equal(marketItem.isSelling, false);
      });

      it("Check Allowance and balance after buy box", async () => {
        let allowance = await deathKingdomCoin.allowance(
          accounts[2],
          marketplace.address
        );
        assert.equal(allowance.toString(), "0");

        assert.equal(
          (await deathKingdomCoin.balanceOf(accounts[2])).toString(),
          DKCToWei("2")
        );
      });

      it("Check owner of NFT after buy box", async () => {
        assert.equal((await tankNFT.ownerOf(1)).toString(), accounts[2]);
      });

      it("Get all Lising NFT on Marketplace after account 2 buy Tank 1 on Marketplace", async () => {
        let listingNFTs = await marketplace.getListingNfts();
        assert.equal(listingNFTs.length, 0);
      });

      it("Get Lising NFT on Marketplace of an address after account 2 buy Tank 1 on Marketplace", async () => {
        let listingNFTs = await marketplace.getMyListingNfts({
          from: accounts[1],
        });
        assert.equal(listingNFTs.length, 0);
      });

      it("Get NFT Sell History on Marketplace after account 2 buy Tank 1 on Marketplace", async () => {
        let listingNFTs = await marketplace.getNftSellHistory(1);
        assert.equal(listingNFTs.length, 2);
      });

      it("Check approval for all", async () => {
        assert.equal((await tankNFT.ownerOf(1)).toString(), accounts[2]);
        assert.equal(
          (
            await tankNFT.isApprovedForAll(accounts[2], marketplace.address)
          ).toString(),
          "false"
        );

        await truffleAssert.passes(
          tankNFT.setApprovalForAll(marketplace.address, "true", {
            from: accounts[2],
          }),
          "passes"
        );

        assert.equal(
          (
            await tankNFT.isApprovedForAll(accounts[2], marketplace.address)
          ).toString(),
          "true"
        );
      });

      it("Account 2 sell tank 1 after buy", async () => {
        await truffleAssert.passes(
          marketplace.listNft(tankNFT.address, 1, DKCToWei("11"), {
            from: accounts[2],
          }),
          "passes"
        );
      });
    });
  });
});
