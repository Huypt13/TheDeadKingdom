const User = require('../user/User.service')
const MarketPlaceItem = require('./MarketPlaceItem.service')
const Box = require('../box/Box.service')
const TankUser = require('../hero/TankUser.service')

//  event NFTListed(
//             uint256 marketItemId,
//             address nftContract,
//             uint256 tokenId,
//             address seller,
//             address buyer,
//             uint256 price
//         );
const listedBoxes = {marketItemId: "1231", nftContract: "012312", tokenId: "5",
seller:"0xeae6d4571143e3098b03ac823394aa4229342885", buyer: null, price: 190}

const listBoxSelling = { marketItemId: "1231", nftContract: "012312", tokenId: "2",
seller: "0xeae6d4571143e3098b03ac823394aa4229342885", buyer: "qwe", price: 120}

const cancel = {marketItemId: "1231", nftContract: "012312", tokenId: "3",
seller: "0xeae6d4571143e3098b03ac823394aa4229342885", buyer: null, price: 120}

{(async()=>{
    // const rs = await TankUser.createTankUser(["7","8"],"0xeae6d4571143e3098b03ac823394aa4229342885","62f20d4b70d1f15ecd11c37a")
    // console.log("result",rs);
    //    const result = await MarketPlaceItem.createAfterListed(listedBoxes)
    //    console.log("result",result);
    //    const result = await MarketPlaceItem.updateAfterSold(listBoxSelling)
    //    console.log("result",result);
    //    const result = await MarketPlaceItem.updateAfterSellCanceled(cancel)
    //    console.log("result",result);
})()};



