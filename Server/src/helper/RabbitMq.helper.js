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

async function soldNotify(data) {
  const { message, email, price, buyer, tankName, url } = data;
  if (channel == null) {
    console.log("data null");
    channel = await connectRabbitMQ();
  }
  await channel.sendToQueue(
    queue,
    Buffer.from(
      JSON.stringify({
        pattern: "sold",
        data: {
          message,
          email,
          price,
          buyer,
          tankName,
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
async function boughtNotify(data) {
  const { message, email, price, seller, tankName, url } = data;
  if (channel == null) {
    console.log("data null");
    channel = await connectRabbitMQ();
  }
  await channel.sendToQueue(
    queue,
    Buffer.from(
      JSON.stringify({
        pattern: "bought",
        data: {
          message,
          email,
          price,
          seller,
          tankName,
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
async function cancelNotify(data) {
  const { message, email, price, tankName, url } = data;
  if (channel == null) {
    console.log("data null");
    channel = await connectRabbitMQ();
  }
  await channel.sendToQueue(
    queue,
    Buffer.from(
      JSON.stringify({
        pattern: "cancelListed",
        data: {
          message,
          email,
          price,
          tankName,
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
async function listedNotify(data) {
  const { message, email, price, tankName, url } = data;
  if (channel == null) {
    console.log("data null");
    channel = await connectRabbitMQ();
  }
  await channel.sendToQueue(
    queue,
    Buffer.from(
      JSON.stringify({
        pattern: "Listed",
        data: {
          message,
          email,
          price,
          tankName,
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
async function resetPasswordNotify(data) {
  const { url, email } = data;
  if (channel == null) {
    console.log("data null");
    channel = await connectRabbitMQ();
  }
  await channel.sendToQueue(
    queue,
    Buffer.from(
      JSON.stringify({
        pattern: "resetPassword",
        data: {
          url,
          email,
        },
      })
    ),
    {
      // RabbitMQ - Khi khởi động lại, tiếp tục chạy
      persistent: true,
    }
  );
}
async function boughtBoxNotify(data) {
  const { url, email, price, message } = data;
  if (channel == null) {
    console.log("data null");
    channel = await connectRabbitMQ();
  }
  await channel.sendToQueue(
    queue,
    Buffer.from(
      JSON.stringify({
        pattern: "boughtBox",
        data: {
          url, email, price,message
        },
      })
    ),
    {
      // RabbitMQ - Khi khởi động lại, tiếp tục chạy
      persistent: true,
    }
  );
}
module.exports = { connectRabbitMQ, registerNotify, soldNotify, boughtNotify, cancelNotify, listedNotify, resetPasswordNotify, boughtBoxNotify } 
