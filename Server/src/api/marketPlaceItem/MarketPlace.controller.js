const MarketPlaceItemService = require('./MarketPlaceItem.Service')
const ApiResponse = require('../../utility/ApiResponse')


class MarketPlaceItemController {
    async getTotalTransactionsByDay(req, res) {
        try{
            const { day } = req.params;
            const statisticalTransaction = await MarketPlaceItemService.getTotalTransitionsByDay(day);
            return ApiResponse.successResponseWithData(res,"Ok",statisticalTransaction);
        } catch(e){
            ApiResponse.serverErrorResponse(res, e.message);
        }     
    }
    async getSucceedTransaction(req, res) {
        try{
            const Transaction = await MarketPlaceItemService.getSucceedTransaction();
            return ApiResponse.successResponseWithData(res,"Ok",Transaction);
        } catch(e){
            ApiResponse.serverErrorResponse(res, e.message);
        }
    }
    
}




























module.exports = new MarketPlaceItemController()










