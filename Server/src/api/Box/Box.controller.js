const BoxService = require('./Box.service')
const ApiResponse = require('../../utility/ApiResponse')
const TankUserService = require('../hero/TankUser.service')
const TankService = require('../hero/Tank.service')






class BoxController {
    async unbox(req, res) {
        try {
            const { tankUserId } = req.body;
            const { _id } = req.locals.user;
            const tankUser = await TankService.getByTankUserById(tankUserId, _id.toString());
            if(!tankUser || tankUser.tankId){
                return ApiResponse.badRequestResponse(res, "Unbox Fail!");
            }
            const boxId = await TankUserService.getBoxId(tankUserId);
            tankId = await BoxService.unbox(boxId);
            return await TankUser.updateData({_id: tankUserId}, {tankId, remaining : 100});

        } catch (err) {
           console.log(err);
           ApiResponse.badRequestResponse(res, "Unbox Fail!")
        }
        
    }
}


module.exports = new BoxController();