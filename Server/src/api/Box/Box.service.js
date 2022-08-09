const Box = require("./Box.Schema");

class BoxService {
    async getByBoxId(boxId) {
        return await Box.findOne({ boxId });
    }

    async getAllBoxes() {
        return await Box.find({});
    }
    async getAllBoxeId() {
        return await Box.find({}).select({_id: 1});
    }

    async unbox(boxId) {
        const boxRate = await this.getByBoxId(boxId);
        return await this.randomTank(boxRate.rate);
    }

    async randomBoxId(){
        const listBoxId = await this.getAllBoxeId();
        const index = Math.floor(Math.random() * listBoxId.length);
        return listBoxId[index]._id.toString();
    }

    async randomTank(boxRate) {
        let random = Math.random();
        let arr = boxRate;               //[{tankId:"a",ratio:0.6},{tankId:"b",ratio:0.3},{tankId:"c",ratio:0.1}]
        let pre = 0;
        let arr2 = [];
        for (var k of arr) {
            k.ratio += pre;
            arr2.push(k);
            pre = k.ratio
        }
        let first = 0;
        let result = {};
        for (var i of arr2) {
            if (first <= random && random < i.ratio) {
                result = i;
                break;
            }
            first = i.ratio
        }
        return result.tankId;
    }


}

module.exports = new BoxService();
