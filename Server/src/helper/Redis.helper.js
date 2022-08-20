const redis = require("redis");
const dotenv = require("dotenv");

dotenv.config();
let config = {
  url: `redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_URI}:${process.env.REDIS_PORT}`,
};
if (process.env.NODE_ENV == "test") {
  config = {
    host: "localhost",
    port: 6379,
  };
}
const redisClient = redis.createClient(config);

redisClient.on("connect", () => console.log("Connected to Redis!", config));
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