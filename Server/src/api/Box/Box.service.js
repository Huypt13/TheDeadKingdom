const Box = require("./Box.Schema");

class BoxService {
    async getByTokenId(tokenId) {
        return await Box.findOne({ boxId: tokenId });
    }

    async insertBox({ tokenId, mintedAddress }) {
        const box1 = await this.getByTokenId(tokenId);
        if (box1) {
            return null;
        }
        const box = await new Box({ boxId: tokenId, mintedAddress }).save();
        return box;
    }


}

module.exports = new BoxService();
