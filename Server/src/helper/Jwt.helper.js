const jwt = require("jsonwebtoken");
const GameInfor = require("./GameInfor.helper");

module.exports.signData = (data, expire) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      data,
      GameInfor.SECRET_KEY,
      { expiresIn: expire },
      (err, token) => {
        if (err) {
          reject(err);
        }
        resolve(token);
      }
    );
  });
};

module.exports.veryfyData = (token) => {
  return jwt.verify(token, GameInfor.SECRET_KEY);
};

module.exports.signDataWithExpiration = (data, expire) => {
  return new Promise((resolve, reject) => {
    jwt.sign(data, GameInfor.SECRET_KEY, { expiresIn: expire }, (err, token) => {
      if (err) {
        reject(err);
      }
      resolve(token);
    });
  });
}
