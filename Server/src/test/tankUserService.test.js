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

describe("test tankuser service", () => {
    jest.setTimeout(30000);
    beforeEach(async () => {
        await testInsert.insertTankData();
        await testInsert.insertTankUserData();
        await testInsert.insertUserData();
        await testInsert.insertBoxData();
        await testInsert.insertMarketPlaceItemData()
    });
    
    test("test update data success", async () => {
        const tankUser = await TankUserService.updateData({_id: mongoose.Types.ObjectId("62ef8e9da0b3eafa898cabd4")},{remaining: 100})
        expect(tankUser.remaining).toBe(100);
    })
    test("test update data fail  with id not exist",async () => {
        const tankUser = await TankUserService.updateData({_id: mongoose.Types.ObjectId("62ef8e9da0b3eafa898cabd0")},{remaining: 100})
        expect(tankUser).toBe(null);
    })
    test("test update data fail  with id can't convert",async () => {
        try {
          const tankUser = await TankUserService.updateData({_id: mongoose.Types.ObjectId("62ef8e9daeafa898cabd0")},{remaining: 100})
        } catch (err) {
            expect(err).not.toBe(null);
        }})
    test("test update data success", async () => {
        const tankUser = await TankUserService.updateData({_id: mongoose.Types.ObjectId("62ef8e9da0b3eafa898cabd4")},{remaining: 90})
        expect(tankUser.remaining).toBe(90);
    })
    test("test update data fail  with id not exist",async () => {
        const tankUser = await TankUserService.updateData({_id: mongoose.Types.ObjectId("62ef8e9da0b3eafa898cabd0")},{remaining: 90})
        expect(tankUser).toBe(null);
    })
    test("test update data fail  with id can't convert",async () => {
        try {
          const tankUser = await TankUserService.updateData({_id: mongoose.Types.ObjectId("62ef8e9daeafa898cabd0")},{remaining: 90})
        } catch (err) {
            expect(err).not.toBe(null);
        }
        
    })
    test("test buy box success", async()=>{
        const {listToken, tokenOwner, boxId} = {listToken:["4","5"], tokenOwner:"0x54a2998Bd96eEEEBc218aB5AAC4fBE357A2e9714", boxId:"62f20d4b70d1f15ecd11c37a"}
        const tankUser = await TankUserService.createTankUser(listToken, tokenOwner, boxId);
        tankUser.map((box, index)=>{
            expect(box.nftId).toBe(listToken[index]);
            expect(box.boxId).toBe("62f20d4b70d1f15ecd11c37a")
        })
    })
    test("test buy box fail token exist", async()=>{
        try{
            const {listToken, tokenOwner, boxId} = {listToken:["1"], tokenOwner:"0x54a2998Bd96eEEEBc218aB5AAC4fBE357A2e9714", boxId:"62f20d4b70d1f15ecd11c37a"}
            const tankUser = await TankUserService.createTankUser(listToken, tokenOwner, boxId);
        } catch(e){
            expect(e.message).toBe("boxId is already existed!")
        }
    })
    test("test buy box fail token ownwer is not connect wallet", async()=>{
        try{
            const {listToken, tokenOwner, boxId} = {listToken:["5"], tokenOwner:"0x54a2998Bd96eEEEBc218aB5AAC4fBE357A2e9764", boxId:"62f20d4b70d1f15ecd11c37a"}
            const tankUser = await TankUserService.createTankUser(listToken, tokenOwner, boxId);
        } catch(e){
            expect(e.message).not.toBe(null)
        }
    })
    test("test buy box fail with boxId not found", async()=>{
        try{
            const {listToken, tokenOwner, boxId} = {listToken:["5"], tokenOwner:"0x54a2998Bd96eEEEBc218aB5AAC4fBE357A2e9714", boxId:"72f20d4b70d1f15ecd11c37a"}
            const tankUser = await TankUserService.createTankUser(listToken, tokenOwner, boxId);
        } catch(e){
            expect(e.message).toBe("Box type not found")
        }
    })
    test("test get box success with _Id", async ()=>{
        const boxId = await TankUserService.getBoxId("62ef8e9da0b3eafa898cabd9");
        expect(boxId).toBe("62f20d4b70d1f15ecd11c37a")
    })
    test("test get box success fail with _Id not found", async ()=>{
        try {
            await TankUserService.getBoxId("62ef8e9da0b3eafa898cabd8");
        } catch (err) {
            expect(err.message).toBe("TankUser not found")
        }
    })
    test("test get tank by userId and nftId sucess", async ()=>{
        const tank = await TankUserService.getTankByUserIdAndnftId("6296d14fb263c0630e920036","1");
        expect(tank[0].userId).toBe("6296d14fb263c0630e920036")
    })
    test("test get tank by userId and nftId fail with userId not found", async ()=>{
        try{
            const tank = await TankUserService.getTankByUserIdAndnftId("6296d14fb263c0630e920038","1");
        } catch(error) {
            expect(error.message).toContain("This tank is not exist")
        }
    })
    test("test get tank by userId and nftId fail with nftId not found", async ()=>{
        try{
            const tank = await TankUserService.getTankByUserIdAndnftId("6296d14fb263c0630e920038","10");
        } catch(error) {
            expect(error.message).toContain("This tank is not exist")
        }
    })




    afterEach(async () => {
        await Tank.deleteMany({});
        await TankUser.deleteMany({});
        await User.deleteMany({});
        await Box.deleteMany({});
        await MarketPlaceItem.deleteMany({});
    });
});