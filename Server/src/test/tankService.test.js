const mongoose = require("mongoose");
const UserService = require("../api/user/User.service");

const MarketPlaceItem = require('../api/marketPlaceItem/MarketPlaceItem.schema');


const Box = require("../api/box/Box.schema");


const TankUser = require("../api/hero/TankUser.schema");


const TankUserService = require("../api/hero/TankUser.service");


const TankService = require("../api/hero/Tank.service");


process.env.NODE_ENV = "test";

const testInsert = require("./testInsert");

const History = require("../api/history/History.schema");

const Tank = require("../api/hero/Tank.schema");

const Database = require("../api/database/Database");
const User = require("../api/user/User.schema");

// npm i -g jest  // global

describe("Test tank Service", () => {
  beforeAll(() => {
    Database.connect();
  });
  jest.setTimeout(30000);
  beforeEach(async () => {
    await testInsert.insertTankData();
    await testInsert.insertTankUserData();
    await testInsert.insertUserData();
    await testInsert.insertBoxData();
    await testInsert.insertMarketPlaceItemData()
  });
  test("test get tank by user id success", async () => {
    let id = "6296d14fb263c0630e920036";
    const tank = await TankService.getTankByUserId(id);
    expect(tank).not.toBe(null)
    expect(tank[0].userId.toString()).toBe(id)
  });
  test("test get tank by user id fail", async () => {
    let id = "6296d14fb263c0630e9240037";
    const tank = await TankService.getTankByUserId(id);
    expect(tank.length).toBe(0);
  });
  test("test get tank by user id can't convert", async () => {
    try{
      let id = "6296d14fb263c0630";
      const tank = await TankService.getTankByUserId(id);
      expect(tank.length).toBe(0);
    } catch(err){
      expect(err).not.toBe(null);
    }
  });
  test("test get tank by id success", async () => {
    const tank = await TankService.getByTankId("62ef8e9da0b3eafa898cabd4", "6296d14fb263c0630e920036")
    expect(tank._id.toString()).toBe("62e11132105338549ed69871")
  });
  test("test get tank by id fail with _id not exist", async () => {
    const tank = await TankService.getByTankId("62ef8e9da0b3eafa898cabaa", "6296d14fb263c0630e920036")
    expect(tank).toBe(null)
  });
  test("test get tank by id fail with _id can't convert", async () => {
    try {
      const tank = await TankService.getByTankId("62ef8e9", "6296d14fb263c0630e920036")
    } catch (error) {
      expect(error).not.toBe(null);
    }
  });
  test("test get tank by id fail with userId not exist", async () => {
    const tank = await TankService.getByTankId("62ef8e9da0b3eafa898cabd4", "6296d14fb263c0630e920037")
    expect(tank).toBe(null)
  });
  test("test get tank by id fail with userId can't convert", async () => {
    try {
      const tank = await TankService.getByTankId("62ef8e9da0b3eafa898cabd4", "6296d14fb263c06")
    } catch (error) {
      expect(error).not.toBe(null);
    }
  });
  test("test get tankuser by id success", async () => {
    const tank = await TankService.getByTankUserById("62ef8e9da0b3eafa898cabd4", "6296d14fb263c0630e920036")
    expect(tank._id.toString()).toBe("62ef8e9da0b3eafa898cabd4")
  });
  test("test get tankuser by id fail", async () => {
    const tank = await TankService.getByTankUserById("62ef8e9da0b3eafa898cabd9", "6296d14fb263c0630e920036")
    expect(tank).toBe(null)
  });
  test("test get tankuser by id can't convert", async () => {
    try {
      const tank = await TankService.getByTankUserById("62ef8e9da0b", "6296d14fb263c0630e920036")
    } catch (error) {
      expect(error).not.toBe(null);
    }
  });
  test("test get tankuser by userId fail", async () => {
    const tank = await TankService.getByTankUserById("62ef8e9da0b3eafa898cabd9", "6296d14fb263c0630e920037")
    expect(tank).toBe(null)
  });
  test("test get tankuser by userid can't convert", async () => {
    try {
      const tank = await TankService.getByTankUserById("62ef8e9da0b", "6296d14fb263c0630e")
    } catch (error) {
      expect(error).not.toBe(null);
    }
  });
  test("test update remaining success", async () => {
    const tankUser = await TankService.updateRemaining("62ef8e9da0b3eafa898cabd4");
    const oldTankUser = await TankUser.findById("62ef8e9da0b3eafa898cabd4");
    expect(oldTankUser.remaining).toBe(tankUser.remaining - 1)
  });
  test("test update remaining fail with id not exist", async () => {
    const tankUser = await TankService.updateRemaining("62ef8e9da0b3eafa898caba3");
    expect(tankUser).toBe(null)
  });
  test("test update remaining fail with id can't convert", async () => {
    try {
      const tankUser = await TankService.updateRemaining("62ef8e9da0b3eafa898");
    } catch (error) {
      expect(error).not.toBe(null);
    }
  });
  test("test get top n tank listed lasted success", async () => {
    const listTank = await TankService.getTopTankListedLastedAndPaging(1,2,1);

    if (listTank.length > 0) {
      expect(listTank[0].tankUser.tankId).not.toBe(null)
    }
    expect(listTank).not.null;
  })
  test("test get top tank listed lasted fail with pageNumbers to much", async () => {
    try {
      const listTank = await TankService.getTopTankListedLastedAndPaging(100,2,3);
    } catch (err) {
      expect(err.message).toBe("Don't have tank")
    }
  })
  test("test get top tank listed lasted fail with limit to much", async () => {
    try {
      const listTank = await TankService.getTopTankListedLastedAndPaging(1,1000,4);
    } catch (err) {
      expect(err.message).toBe("Don't have tank")
    }
  })
  test("test get total tank sold lasted success", async () => {
    const listTank = await TankService.getTotalTankSoldLasted();
    if (listTank.length > 0) {
      expect(listTank[0].tankUser.tankId).not.toBe(null)
    }
    expect(listTank).not.toBe(null)
  })
  test("test get tanks sold lasted paging success", async () => {
    const listTank = await TankService.getTankSoldLastedAndPaging(1, 1);
    if (listTank.length > 0) {
      expect(listTank[0].tankUser.tankId).not.toBe(null)
    }
    expect(listTank).not.toBe(null)
  })
  test("test get tanks sold lasted and paging fail with page number to much", async () => {
    try {
      const listTank = await TankService.getTankSoldLastedAndPaging(134, 2);
      if (listTank.length > 0) {
        expect(listTank[0].tankUser.tankId).not.toBe(null)
      }
    } catch (err) {
      expect(err.message).toContain("Don't have tank");
    }
  })
  test("test get tanks sold lasted and paging fail with page number to much", async () => {
    try {
      const listTank = await TankService.getTankSoldLastedAndPaging(1, 200);
      if (listTank.length > 0) {
        expect(listTank[0].tankUser.tankId).not.toBe(null)
      }
    } catch (err) {
      expect(err.message).toContain("Don't have tank");
    }
  })
  test("test get tank unsold details success by id", async () => {
    try {
      const listTank = await TankService.getTankUnsoldDetailsById("62e11132105338549ed69871")
      if (listTank.length > 0) {
        expect(listTank[0].tankUser.tankId).not.toBe(null)
      }
    } catch (err) {
      expect(err.message).toContain("Don't have tank");
    }
  })
  test("test get tank unsold details fail by id not found", async () => {

    const listTank = await TankService.getTankUnsoldDetailsById("62e11132105338549ed69898")
    expect(listTank.length).toBe(0);


  })
  test("test get tank unsold details success by id can't convert", async () => {
    try {
      const listTank = await TankService.getTankUnsoldDetailsById("62e11132105")
    } catch (err) {
      expect(err.message).not.toBe(null);
    }
  })
  test("test get tank sold details success by id", async () => {
    try {
      const listTank = await TankService.getTankSoldDetailsById("62e11132105338549ed69871")
      if (listTank.length > 0) {
        expect(listTank[0].tankUser.tankId).not.toBe(null)
      }
    } catch (err) {
      expect(err.message).toContain("Don't have tank");
    }
  })
  test("test get tank sold details fail by id not found", async () => {

    const listTank = await TankService.getTankSoldDetailsById("62e11132105338549ed69898")
    expect(listTank.length).toBe(0);


  })
  test("test get tank sold details success by id can't convert", async () => {
    try {
      const listTank = await TankService.getTankSoldDetailsById("62e11132105")
    } catch (err) {
      expect(err.message).not.toBe(null);
    }
  })
  test("test get top listed lasted with filter success ", async () => {
    const filter = { levels: [1, 2, 3], classTypes: [1, 2, 3], typeIds: ["001", "002", "003"], sortBy: { name: -1 } }
    const listTank = await TankService.getTopListedLastedWithFilter(filter);
    expect(listTank).not.toBe(null);
  })
  test("test get top listed lasted with filter success ", async () => {
    const filter = { levels: [1, 2, 3], classTypes: [1, 2, 3], typeIds: ["001", "002", "003"], sortBy: { createdAt: -1 } }
    const listTank = await TankService.getTopListedLastedWithFilter(filter);
    expect(listTank).not.toBe(null);
  })
  test("test get top listed lasted with filter success ", async () => {
    const filter = { levels: [3, 4, 5], classTypes: [1, 2, 3], typeIds: ["001", "002", "003"], sortBy: { createdAt: -1 } }
    const listTank = await TankService.getTopListedLastedWithFilter(filter);
    expect(listTank).not.toBe(null);
  })
  test("test get top listed lasted with filter success ", async () => {
    const filter = { levels: [3, 4, 5], classTypes: [6, 7, 8], typeIds: ["004", "005", "006"], sortBy: { remaining: -1 } }
    const listTank = await TankService.getTopListedLastedWithFilter(filter);
    expect(listTank).not.toBe(null);
  })

  test("test get tanks owner  success ", async () => {
    const listTank = await TankService.getTotalTankOwner("6296d14fb263c0630e920036");
    expect(listTank).not.toBe(null);
  })
  test("test get tanks owner with filter fail with id not found", async () => {
    try {
      const listTank = await TankService.getTotalTankOwner("6296d14fb263c0630e920078");
    } catch (err) {
      expect(err.message).toContain("Don't have tank");
    }
  })
  test("test get tanks owner with filter fail with id can't convert", async () => {
    try {
      const listTank = await TankService.getTotalTankOwner("6296d14fb263c0630e9");
    } catch (err) {
      expect(err).not.toBe(null);
    }
  })
  test("test get tanks owner with filter success ", async () => {
    const listTank = await TankService.getTotalTankOwnerPaging("6296d14fb263c0630e920036", { pageNumbers: 1, limit: 2 });
    expect(listTank).not.toBe(null);
  })
  test("test get tanks owner with filter fail with id not found", async () => {
    try {
      const listTank = await TankService.getTotalTankOwnerPaging("6296d14fb263c0630e920078", { pageNumbers: 1, limit: 1 });
    } catch (err) {
      expect(err.message).toContain("Don't have tank");
    }
  })
  test("test get tanks owner with filter fail with page number to much", async () => {
    try {
      const listTank = await TankService.getTotalTankOwnerPaging("6296d14fb263c0630e920036", { pageNumbers: 133, limit: 1 });
    } catch (err) {
      expect(err.message).toContain("Don't have tank");
    }
  })
  test("test get tanks owner with filter fail with limt number to much", async () => {
    try {
      const listTank = await TankService.getTotalTankOwnerPaging("6296d14fb263c0630e920036", { pageNumbers: 133, limit: 1000 });
    } catch (err) {
      expect(err.message).toContain("Don't have tank");
    }
  })
  test("test get tanks owner with filter fail with id can't convert'", async () => {
    try {
      const listTank = await TankService.getTotalTankOwnerPaging("6296d14fb263c0", { pageNumbers: 133, limit: 1 });
    } catch (err) {
      expect(err.message).not.toBe(null);
    }
  })
  test("test get tanks owner with status 'Owned' and paging success", async() => {
     const filter = {limit: 1, pageNumbers:1, sortBy:{name: -1 }, status: "Owned"}
     const listTank = await TankService.getTotalTankOwnerWithStatusAndPaging(filter,"6296d14fb263c0630e920036")
     expect(listTank).not.toBe(null);
  })
  test("test get tanks owner with status 'Owned'  and paging false with id not found", async() => {
    try{
      const filter = {limit: 1, pageNumbers:1, sortBy:{name: -1 }, status: "Owned"}
      const listTank = await TankService.getTotalTankOwnerWithStatusAndPaging(filter,"6296d14fb263c0630e920090")
    }catch(err){
      expect(err.message).toContain("Don't have tank")
    }
  })
  test("test get tanks owner with status 'Owned'  and paging fail with id can't convert", async() => {
    try{
      const filter = {limit: 1, pageNumbers:1, sortBy:{name: -1 }, status: "Owned"}
      const listTank = await TankService.getTotalTankOwnerWithStatusAndPaging(filter,"6296d14fb263c0")
    }catch(err){
      expect(err).not.toBe(null);
    }
  })
  test("test get tanks owner with status 'Owned'  and paging fail with pageNumbers to much", async() => {
    try{
      const filter = {limit: 1, pageNumbers:1000, sortBy:{remaning: -1 }, status: "isSelling"}
      const listTank = await TankService.getTotalTankOwnerWithStatusAndPaging(filter,"6296d14fb263c0630e920036")
    }catch(err){
      expect(err.message).toContain("Don't have tank")
    }
  })
  test("test get tanks owner with status 'Owned'  and paging fail with limit to much", async() => {
    try{
      const filter = {limit: 1000, pageNumbers:100, sortBy:{remaning: -1 }, status: "isSelling"}
      const listTank = await TankService.getTotalTankOwnerWithStatusAndPaging(filter,"6296d14fb263c0630e920090")
    }catch(err){
      expect(err.message).toContain("Don't have tank")
    }
  })
  
  test("test get tanks owner with status 'Owned'  success", async() => {
    const filter = { sortBy:{name: -1 }, status: "Owned"}
    const listTank = await TankService.getTotalTankOwnerWithStatus(filter,"6296d14fb263c0630e920036")
    expect(listTank).not.toBe(null);
 })
 test("test get tanks owner with status 'Owned' false with id not found", async() => {
   try{
     const filter = { sortBy:{name: -1 }, status: "Owned"}
     const listTank = await TankService.getTotalTankOwnerWithStatus(filter,"6296d14fb263c0630e920090")
   }catch(err){
     expect(err.message).toContain("Don't have tank")
   }
 })
 test("test get tanks owner with status 'Owned' fail with id can't convert", async() => {
   try{
     const filter = {sortBy:{remaining: -1 }, status: "Owned"}
     const listTank = await TankService.getTotalTankOwnerWithStatus(filter,"6296d14fb263c0630e")
   }catch(err){
     expect(err).not.toBe(null);
   }
 })
  test("test get tanks owner with status 'isSelling'  success", async() => {
    const filter = { sortBy:{remaining: -1 }, status: "isSelling"}
    const listTank = await TankService.getTotalTankOwnerWithStatus(filter,"6296d14fb263c0630e920036")
    expect(listTank[0].marketplaceItem.isSelling).toBe(true);
 })
 test("test get tanks owner with status 'isSelling' false with id not found", async() => {
   try{
     const filter = { sortBy:{remaining: -1 }, status: "isSelling"}
     const listTank = await TankService.getTotalTankOwnerWithStatus(filter,"6296d14fb263c0630e920090")
   }catch(err){
     expect(err.message).toContain("Don't have tank")
   }
 })
 test("test get tanks owner with status 'isSelling' fail with id can't convert", async() => {
   try{
     const filter = {sortBy:{name: -1 }, status: "isSelling"}
     const listTank = await TankService.getTotalTankOwnerWithStatus(filter,"6296d14fb263c0630e9")
   }catch(err){
     expect(err).not.toBe(null);
   }
 })



  afterEach(async () => {
    await Tank.deleteMany({});
    await TankUser.deleteMany({});
    await User.deleteMany({});
    await Box.deleteMany({});
    await MarketPlaceItem.deleteMany({});
  });
  afterAll(() => {
    mongoose.disconnect();
  });
});
