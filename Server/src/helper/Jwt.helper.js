const jwt = require("jsonwebtoken");
const GameInfor = require("./GameInfor.helper");

module.exports.signData = (data) => {
  return new Promise((resolve, reject) => {
    jwt.sign(data, GameInfor.SECRET_KEY,{expiresIn:'1d'}, (err, token) => {
      if (err) {
        reject(err);
      }
      resolve(token);
    });
  });
};

module.exports.veryfyData = (token) => {
  return jwt.verify(token, GameInfor.SECRET_KEY);
};
