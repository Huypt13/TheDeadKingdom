


module.exports.validateReqBody = async (req, res, next) => {
    const { levels, classTypes, typeIds, limit, pageNumbers, sortBy, status } = req.body;
    if (limit >= 100 || limit <= 0 || !limit) {
        req.body.limit = 1;
    }
    if (pageNumbers >= 100 || pageNumbers <= 0 || !pageNumbers) {
        req.body.pageNumbers = 1;
    }
    if (!levels || ((typeof levels) != "object")) {
        req.body.levels = [1, 2, 3];
    }
    if (!classTypes || ((typeof classTypes) != "object")) {
        req.body.classTypes = [1, 2, 3];
    }
    if (!typeIds || ((typeof typeIds) != "object")) {
        req.body.typeIds = ["001", "002", "003"];
    }
    if (!sortBy || ((typeof sortBy) != "object")) {
        req.body.sortBy = { name: -1 }
    }
    if (!status || ((typeof status) != "string")) {
        req.body.status = "Owned"
    }
    next();
}



//  const filter= { levels: [1, 2, 3], classTypes: [1, 2, 3], typeIds: ["001", "002", "003"],
//    sortBy: { name: -1 }, pageNumbers: 5, limit : 1 }


module.exports.validateReqQuery = async (req, res, next) => {
    const { pageNumbers, limit } = req.query;
    if (limit >= 100 || limit <= 0 || !limit) {
        req.query.limit = 1;
    }
    if (pageNumbers >= 100 || pageNumbers <= 0 || !pageNumbers) {
        req.query.pageNumbers = 1;
    }
    console.log("reqQuery", req.query);
    next();
}