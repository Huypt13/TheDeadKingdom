const redis = require("redis");
const dotenv = require("dotenv");

dotenv.config();
let config = {
  url: `redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_URI}:${process.env.REDIS_PORT}`,
};
if (process.env.NODE_ENV == "test") {
  config = {
    url: "redis://default:9nLt8fIbpgnTRVhfDoJrmChoxRJ0AJeG@redis-17401.c80.us-east-1-2.ec2.cloud.redislabs.com:17401",
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
  console.log(arr.length);
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
