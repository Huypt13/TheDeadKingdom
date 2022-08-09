const UserController = require('../api/user/User.controller')
const UserService = require('../api/user/User.service')
const TankController = require('../api/hero/Tank.controller')
const TankService = require('../api/hero/Tank.service')
const TankUserController = require('../api/hero/TankUser.controller')
const TankUserService = require('../api/hero/TankUser.service')
const MarketPlaceItemService = require('../api/marketPlaceItem/MarketPlaceItem.Service')
const MarketPlaceController = require('../api/marketPlaceItem/MarketPlace.controller')
const BoxService = require('../api/Box/Box.service')
const BoxController = require('../api/Box/Box.controller')




class testApi {
    // event NFTListed(
    //     uint256 marketItemId,
    //     address nftContract,
    //     uint256 tokenId,
    //     address seller,
    //     address buyer,
    //     uint256 price
    // );

    async runTest() {
        const list = {
            marketItemId: "111", nftContract: "ad123",
            tokenId: "1", seller: "ad112", buyer: "ad1123",
            price: "103.4"
        }
        const listTokenId = ["1","2","3"]
        const tokenOwner = "ad112"
        const boxId = "62f20d4b70d1f15ecd11c37a"
            // MarketPlaceItemService.createAfterListed(list);
            // MarketPlaceItemService.updateAfterSellCanceled(list)
            // MarketPlaceItemService.updateAfterSold(list);
        //   TankUserService.createTankUser(listTokenId, tokenOwner, boxId)
        // const tankUserId = "62f214a3853c1babeca5f5f1";
        // const tankId = await BoxService.unbox("62f20d4b70d1f15ecd11c37a");
        // return await TankUserService.updateData({_id: tankUserId}, {tankId, remaining : 100});
  
    }
}











module.exports = new testApi();

