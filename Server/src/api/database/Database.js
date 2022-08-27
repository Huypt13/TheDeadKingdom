const mongoose = require("mongoose");
const uri = process.env.MONGO_URI;
// const uri = "mongodb://localhost:27017/tank_db"
module.exports.connect = async (app) => {
  mongoose.connect(
    uri || "mongodb://localhost:27017/tank_dbtest?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    function (err, res) {
  
      if (err) {
        console.log("Error connecting to the database.. " + err);
      } else {
        console.log("Connected to Database: " + uri);
      }
    }
  );
};
