const { TwoDecimals } = require("../../utility/MethodExtensions");

function getDame(tank, damage) {
  return TwoDecimals(
    damage * Math.pow(0.5, (tank?.armor ? tank.armor : 0) / 100)
  );
}

module.exports = { getDame };
