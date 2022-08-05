const GameInfor = require("./GameInfor.helper");

const getRank = (star) => {
  const rank = GameInfor.Ranking[Math.floor(star / 20)];
  return rank + " " + Math.floor(5 - (star % 20) / 5);
};
const getStar = (star) => {
  if (star <= 100) return star % 5 == 0 ? 5 : star % 5;
  return star % 100;
};

// cung co the dau cung nhau cung muc thuong
const getLevelRank = (star) => {
  return Math.floor(star / 30);
};

module.exports = { getRank, getStar, getLevelRank };
