function TwoDecimals(value) {
  return (Math.round(value * 100) / 100).toFixed(2);
}

module.exports = { TwoDecimals };
