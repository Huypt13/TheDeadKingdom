const testInsert = require("./testInsert");

const MarketPlaceItem = require('../api/marketPlaceItem/MarketPlaceItem.schema');


const Box = require("../api/box/Box.schema");


const TankUser = require("../api/hero/TankUser.schema");


const TankUserService = require("../api/hero/TankUser.service");


const TankService = require("../api/hero/Tank.service");
const BoxService = require("../api/box/Box.service");



process.env.NODE_ENV = "test";

const bcrypt = require("bcrypt");
const Tank = require("../api/hero/Tank.schema");

const Database = require("../api/database/Database");
const User = require("../api/user/User.schema");
const UserService = require("../api/user/User.service");
const mongoose = require("mongoose");

// npm i -g jest  // global
Database.connect();

describe("Test box service", () => {
    jest.setTimeout(30000);
    beforeEach(async () => {
        await testInsert.insertTankData();
        await testInsert.insertTankUserData();
        await testInsert.insertUserData();
        await testInsert.insertBoxData();
        await testInsert.insertMarketPlaceItemData()
    })
    test("test get box by box id success", async () => {
        const box = await BoxService.getByBoxId("62f20d4b70d1f15ecd11c37a")
        expect(box._id.toString()).toBe("62f20d4b70d1f15ecd11c37a")
    });
    test("test get box by box id not found", async () => {
        const box = await BoxService.getByBoxId("62f20d4b70d1f15ecd11c37b")
        expect(box).toBe(null)
    });
    test("test get box by box id can't convert", async () => {
        try {
            const box = await BoxService.getByBoxId("62f20d4b70d1f15ecd11")
        } catch (error) {
            expect(error).not.toBe(null)
        }
    });
    test('test unbox success', async () => {
        const tankId = await BoxService.unbox("62f20d4b70d1f15ecd11c37a");
        expect(tankId).not.toBe(null)
    })
    test('test unbox fail with id not found', async () => {
        const tankId = await BoxService.unbox("62f20d4b70d1f15ecd11c397");
        expect(tankId).toBe(null)
    })
    test("test unbox fail with id can't convert", async () => {
        try {
            const tankId = await BoxService.unbox("62f20d4b70d1f15ecd1");
        } catch (e) {
            expect(e.message).toBe("Unbox Fail")
        }
    })
    test("test get random boxId", async () => {
        const boxId = await BoxService.randomBoxId();
        const box = await BoxService.getByBoxId(boxId);
        expect(box).not.toBe(null);
    })
    test("test get random tank success", async () => {
        const box = await BoxService.getByBoxId("62f20d4b70d1f15ecd11c37a");
        const tankId = await BoxService.randomTank(box.rate)
        expect(tankId).not.toBe(null);
    })
    test("test get random tank fail with input null", async () => {
        const tankId = await BoxService.randomTank(null)
        expect(tankId).toBe(null);
    })
    test("test get all boxes owner success", async ()=>{
        const listBox = await BoxService.getAllBoxOwner("6296d13fb263c0630e920031");
        expect(listBox.length).toBeGreaterThanOrEqual(0)
    })
    test("test get all boxes owner fail with id not found", async ()=>{
        const listBox = await BoxService.getAllBoxOwner("6296d13fb263c0630e920081");
        expect(listBox.length).toBe(0)
    })
    test("test get all boxes owner fail with id can't convert", async ()=>{
        try{
            const listBox = await BoxService.getAllBoxOwner("6296d13fb263c063");
        } catch(err){
            expect(err).not.toBe(null);
        }
      
    })
    test("test get all boxes owner and paging success", async ()=>{
        const listBox = await BoxService.getAllBoxOwnerAndPaging({pageNumbers:1, limit:1},"6296d13fb263c0630e920031");
        console.log("listBox", listBox);
        expect(listBox).not.toBe(null)
    })
    test("test get all boxes owner and paging fail with id not found", async ()=>{
        try{
            const listBox = await BoxService.getAllBoxOwnerAndPaging({pageNumbers:1, limit:1},"6296d13fb263c0630e920081");
        }catch(err){
            expect(err.message).toBe("Don't have box")
        }
    })
    test("test get all boxes owner and paging fail with id can't convert", async ()=>{
        try{
            const listBox = await BoxService.getAllBoxOwnerAndPaging({pageNumbers:1, limit:1},"6296d13fb263c06");
        } catch(err){
            expect(err).not.toBe(null);
        }
      
    })

    test("test get all boxes owner and paging fail with pageNumbers to much", async ()=>{
        try{
            const listBox = await BoxService.getAllBoxOwnerAndPaging({pageNumbers:90, limit:1},"6296d13fb263c0630e920081");
        }catch(err){
            expect(err.message).toBe("Don't have box")
        }
    })
    test("test get all boxes owner and paging fail with limit to much", async ()=>{
        try{
            const listBox = await BoxService.getAllBoxOwnerAndPaging({pageNumbers:1, limit:98},"6296d13fb263c0630e920081");
        }catch(err){
            expect(err.message).toBe("Don't have box")
        }
    })


    afterEach(async () => {
        await Tank.deleteMany({});
        await TankUser.deleteMany({});
        await User.deleteMany({});
        await Box.deleteMany({});
        await MarketPlaceItem.deleteMany({});
    })
})