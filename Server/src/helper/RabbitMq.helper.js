const amqp = require("amqplib");

const queue = "notification_queue";

var connection;

// Kết nối RabbitMQ
async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(
      "amqps://xdtwwtef:XT_JcoaRWjuLnWOMpimCBNyUgY_ZYtPu@armadillo.rmq.cloudamqp.com/xdtwwtef"
    );
    console.info("connect to RabbitMQ success");

    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
      noAck: true,
      durable: false,
      messageTtl: 40000,
    });
    connection.on("error", function (err) {
      console.log(err);
      setTimeout(connectRabbitMQ, 10000);
    });

    connection.on("close", function () {
      console.error("connection to RabbitQM closed!");
      setTimeout(connectRabbitMQ, 10000);
    });
    return channel;
  } catch (err) {
    console.error(err);
    setTimeout(connectRabbitMQ, 10000);
  }
}

let channel;
async function registerNotify(data) {
  const { email, username, url } = data;
  if (channel == null) {
    console.log("data null");
    channel = await connectRabbitMQ();
  }
  await channel.sendToQueue(
    queue,
    Buffer.from(
      JSON.stringify({
        pattern: "register",
        data: {
          email,
          username,
          url,
        },
      })
    ),
    {
      // RabbitMQ - Khi khởi động lại, tiếp tục chạy
      persistent: true,
    }
  );
}
module.exports = { connectRabbitMQ, registerNotify };
