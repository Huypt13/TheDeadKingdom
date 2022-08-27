const testInsert = require("./testInsert");

const MarketPlaceItem = require('../api/marketPlaceItem/MarketPlaceItem.schema');


const Box = require("../api/box/Box.schema");


const TankUser = require("../api/hero/TankUser.schema");


const TankUserService = require("../api/hero/TankUser.service");


const TankService = require("../api/hero/Tank.service");
const MarketPlaceItemService = require("../api/marketPlaceItem/MarketPlaceItem.service");



process.env.NODE_ENV = "test";

const bcrypt = require("bcrypt");
const Tank = require("../api/hero/Tank.schema");

const Database = require("../api/database/Database");
const User = require("../api/user/User.schema");
const UserService = require("../api/user/User.service");
const mongoose = require("mongoose");
Database.connect();
// event NFTListed(
//     uint256 marketItemId,
//     address nftContract,
//     uint256 tokenId,
//     address seller,
//     address buyer,
//     uint256 price
// );

// const marketPlace = {
//     marketItemId: "1231", nftContract: "012312", tokenId: "1",
//     seller: "0x54a2998Bd96eEEEBc218aB5AAC4fBE357A2e9714", buyer: null, price: "100"
// }

describe("Test marketplaceitem service", () => {
    jest.setTimeout(30000);
    beforeEach(async () => {
        await testInsert.insertTankData();
        await testInsert.insertTankUserData();
        await testInsert.insertUserData();
        await testInsert.insertBoxData();
        await testInsert.insertMarketPlaceItemData()
    });

    test("test list tank to sale success", async () => {
        const marketPlace = {
            marketItemId: "1231", nftContract: "012312", tokenId: "1",
            seller:"0x54a2998Bd96eEEEBc218aB5AAC4fBE357A2e9714", buyer: null, price: "1000000000000000000"
        }
        const result = await MarketPlaceItemService.createAfterListed(marketPlace);
        expect(result.buyer).toBe(null);
        expect(result.marketItemId).toBe(marketPlace.marketItemId)
        expect(result.price).toBe(marketPlace.price)
        expect(result.isSelling).toBe(true)

    })
    test("test list tank to sale success", async () => {
        const marketPlace = {
            marketItemId: "1231", nftContract: "12234", tokenId: "1",
            seller:"0x54a2998Bd96eEEEBc218aB5AAC4fBE357A2e9714", buyer: null, price: "1000000000000000000"
        }
        const result = await MarketPlaceItemService.createAfterListed(marketPlace);
        expect(result.buyer).toBe(null);
        expect(result.marketItemId).toBe(marketPlace.marketItemId)
        expect(result.price).toBe(marketPlace.price)
        expect(result.isSelling).toBe(true)

    })
    test("test list tank to sale fail with seller not yet connect wallet", async () => {
        const marketPlace = {
            marketItemId: "1231", nftContract: "012312", tokenId: "1",
            seller: "0x54a2998Bd96eEEEBc218aB5AAC4fBE357A2e9718", buyer: null, price: "100"
        }
        try {
            const result = await MarketPlaceItemService.createAfterListed(marketPlace);
        } catch (err) {
            expect(err.message).not.toBe(null)
        }
    })
    test("test list tank to sale fail with tokenId not exist", async () => {
        const marketPlace = {
            marketItemId: "1231", nftContract: "012312", tokenId: "12",
            seller: "0x54a2998Bd96eEEEBc218aB5AAC4fBE357A2e9714", buyer: null, price: "100"
        }
        try {
            const result = await MarketPlaceItemService.createAfterListed(marketPlace);
        } catch (err) {
            expect(err.message).toBe("This tank is not exist")
        }
    })
    test("test list tank to sale fail with tokenId not exist", async () => {
        const marketPlace = {
            marketItemId: "1231", nftContract: "012312", tokenId: "10",
            seller: "0x54a2998Bd96eEEEBc218aB5AAC4fBE357A2e9714", buyer: null, price: "100"
        }
        try {
            const result = await MarketPlaceItemService.createAfterListed(marketPlace);
        } catch (err) {
            expect(err.message).toBe("This tank is not exist")
        }
    })
    //---
    test("test after sold tank success", async () => {
        const marketPlace = {
            marketItemId: "1231", nftContract: "012312", tokenId: "2",
            seller: "0x54a2998Bd96eEEEBc218aB5AAC4fBE357A2e9714", buyer: "0x0c3DFD77D632BebC1E27927FD39a6579CDa54f03", price: "1000000000000000000"
        }
        const result = await MarketPlaceItemService.updateAfterSold(marketPlace);
        expect(result.buyer).not.toBe(null);
        expect(result.marketItemId).toBe(marketPlace.marketItemId)
        expect(result.isSelling).toBe(false)

    })
    test("test after sold tank fail with seller not yet connect wallet", async () => {
        const marketPlace = {
            marketItemId: "1231", nftContract: "012312", tokenId: "1",
            seller: "0x54a2998Bd96eEEEBc218aB5AAC4fBE357A2e978", buyer: "0xBa39437b944378c9bD385c1082828C9c2dE1383E", price: "100"
        }
        try {
            const result = await MarketPlaceItemService.updateAfterSold(marketPlace);
        } catch (err) {
            expect(err.message).not.toBe(null)
        }
    })
    test("test after sold tank fail with buyer not yet connect wallet", async () => {
        const marketPlace = {
            marketItemId: "1231", nftContract: "012312", tokenId: "1",
            seller: "0x54a2998Bd96eEEEBc218aB5AAC4fBE357A2e9718", buyer: "0xBa39437b944378c9bD385c1082828C9c2dE13835", price: "100"
        }
        try {
            const result = await MarketPlaceItemService.updateAfterSold(marketPlace);
        } catch (err) {
            expect(err.message).not.toBe(null)
        }
    })
    test("test after sold tank fail with buyer and seller the same address", async () => {
        const marketPlace = {
            marketItemId: "62f20d4b", nftContract: "12234", tokenId: "1",
            seller: "0x54a2998Bd96eEEEBc218aB5AAC4fBE357A2e9714", buyer: "0x54a2998Bd96eEEEBc218aB5AAC4fBE357A2e9714", price: "100"
        }
        try {
            const result = await MarketPlaceItemService.updateAfterSold(marketPlace);
        } catch (err) {
            expect(err.message).toBe("Buyer address must different seller")
        }
    })
    test("test after sold tank fail with tokenId not exist", async () => {
        const marketPlace = {
            marketItemId: "62f20d4b", nftContract: "12234", tokenId: "10",
            seller: "0x54a2998Bd96eEEEBc218aB5AAC4fBE357A2e9714", buyer: "0x0c3DFD77D632BebC1E27927FD39a6579CDa54f03", price: "120"
        }
        try {
            const result = await MarketPlaceItemService.updateAfterSold(marketPlace);
        } catch (err) {
            expect(err.message).toBe("Sold fail")
        }
    })
    //---
    test("test cancel listed tank success", async () => {
        const marketPlace = {
            marketItemId: "1231", nftContract: "012312", tokenId: "2",
            seller: "0x54a2998Bd96eEEEBc218aB5AAC4fBE357A2e9714", buyer: null, price: "120"
        }
        const result = await MarketPlaceItemService.updateAfterSellCanceled(marketPlace);
        expect(result.buyer).toBe(null);
        expect(result.marketItemId).toBe(marketPlace.marketItemId)
        expect(result.isSelling).toBe(false)

    })
    test("test cancel listed tank success", async () => {
        const marketPlace = {
            marketItemId: "62f20d4b", nftContract: "12234", tokenId: "2",
            seller: "0x54a2998Bd96eEEEBc218aB5AAC4fBE357A2e9714", buyer: null, price: "120"
        }
        const result = await MarketPlaceItemService.updateAfterSellCanceled(marketPlace);
        expect(result.buyer).toBe(null);
        expect(result.marketItemId).toBe(marketPlace.marketItemId)
        expect(result.isSelling).toBe(false)

    })
    test("test cancel listed tank fail with seller not yet connect wallet", async () => {
        const marketPlace = {
            marketItemId: "1231", nftContract: "012312", tokenId: "1",
            seller: "0x54a2998Bd96eEEEBc218aB5AAC4fBE357A2e978", buyer: null, price: "120"
        }
        try {
            const result = await MarketPlaceItemService.updateAfterSellCanceled(marketPlace);
        } catch (err) {
            expect(err.message).not.toBe(null)
        }
    })

    test("test cancel listed tank fail with tokenId not exist", async () => {
        const marketPlace = {
            marketItemId: "62f20d4b", nftContract: "12234", tokenId: "10",
            seller: "0x54a2998Bd96eEEEBc218aB5AAC4fBE357A2e9714", buyer: null, price: "20"
        }
        try {
            const result = await MarketPlaceItemService.updateAfterSellCanceled(marketPlace);
        } catch (err) {
            expect(err.message).toBe("This tank is not exist")
        }
    })
    //---
    test("test get total transaction by day success", async()=>{
        const listTransaction = await MarketPlaceItemService.getTotalTransactionsByDay(1);
        expect(listTransaction.length).not.toBe(null)
    })
    test("test get total transaction by day success", async()=>{
        const listTransaction = await MarketPlaceItemService.getTotalTransactionsByDay(25);
        expect(listTransaction.length).not.toBe(null)
    })
    test("test get total transaction by day fail with day exceed the allowed amount", async()=>{
        try{

            const listTransaction = await MarketPlaceItemService.getTotalTransactionsByDay(32);
        } catch(error) {
            expect(error.message).toBe("Day exceed the allowed amount")
        }
    })
    test("test get succeed transaction of user success by id", async()=>{
        const listTransaction = await MarketPlaceItemService.getSucceedTransaction("6296d14fb263c0630e920036");
        if(listTransaction.length > 0){
            for(let transaction of listTransaction){
                if(transaction.buyer === "6296d14fb263c0630e920036"){
                    expect(transaction.buyer).toBe("6296d14fb263c0630e920036")
                }else{
                    expect(transaction.seller).toBe("6296d14fb263c0630e920036")
                }
            }
        }else{
            expect(listTransaction.length).toBe(0);
        }
    })
    test("test get succeed transaction of user fail by id not found", async()=>{
        const listTransaction = await MarketPlaceItemService.getSucceedTransaction("6296d14fb263c0630e920090");
        expect(listTransaction.length).toBe(0)
   
    })
    test("test get succeed transaction of user fail with id can't convert", async()=>{
        try {
            const listTransaction = await MarketPlaceItemService.getSucceedTransaction("dddsda");
        } catch(err) {
            expect(err).not.toBe(null)
        }
    })

  



    afterEach(async () => {
        await Tank.deleteMany({});
        await TankUser.deleteMany({});
        await User.deleteMany({});
        await Box.deleteMany({});
        await MarketPlaceItem.deleteMany({});
    });
})