const redis = require("redis");
const dotenv = require("dotenv");

//const config = require('../config');
// {
//     host: config.redis.host,
//     port: config.redis.port,
//     password: config.redis.password
// }
dotenv.config();

const redisClient = redis.createClient({
  url: `redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_URI}:${process.env.REDIS_PORT}`,
});

// const redisClient = redis.createClient({
//   host: "redis-18906.c114.us-east-1-4.ec2.cloud.redislabs.com",
//   port: 18906,
//   // password: "MNRQAgRq4YOHFEisFKnLJxv96fbekIOB",
// });
redisClient.on("connect", () => console.log("Connected to Redis!"));
redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.connect();

async function saveWithTtl(key, value, ttlSeconds = 60) {
  console.log(value);
  const rs = await redisClient.set(key, value, "EX", ttlSeconds);
  await redisClient.expire(key, ttlSeconds);
  return rs;
}

async function delAllByValue(value) {
  let arr = await redisClient.keys("*");
  for (const key of arr) {
    let rdValue = await get(key);
    if (rdValue === value) {
      console.log("remove :", key);
      await redisClient.del(key);
    }
  }
}

async function get(key) {
  return await redisClient.get(key);
}

module.exports = {
  saveWithTtl,
  get,
  delAllByValue,
};
