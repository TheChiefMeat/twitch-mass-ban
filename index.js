require("dotenv").config({ path: "./auth.env" });
const _tmi = require("tmi.js");
const _fs = require("fs");

const globals = {
  script: process.argv[1],
  channel: process.argv[2],
  file: process.argv[3],
  reason: process.argv[4],
  delay: process.argv[5].toString()
};

// Create option object. Contains configuration for _tmi.client()
const options = {
  options: { debug: false },
  connection: { reconnect: true, secure: true },
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_OAUTH,
  },
  channels: [globals.channel],
};

// Construct new client with options [Object];
// Export client out of module as 'client'
const client = new _tmi.client(options);

// Connect previously constructed client
client.connect();

client.on("connected", () => {
  doIt();
});

function doIt() {
  _fs.readFile(globals.file, "utf8", (error, fileData) => {
    if (error) throw error;

    let banList = fileData.split("\n");
    let banQueue = banList;
    let banTotal = banQueue.length;

    const delay = (ms) => new Promise((res) => setTimeout(res, ms));

    if (banQueue.length != 0) {
      let channel = globals.channel.toString();
      let reason = globals.reason.toString();
      const BanFunction = async () => {
        do {
          client.say(channel, `/ban ${banQueue[0].toString()} ${reason}`);
          console.log(
            `#${channel}: User #${
              banTotal - banQueue.length + 1
            } | ${banQueue[0].toString()} has been banned from the channel.`
          );
          banQueue.shift();
          await delay(globals.delay);
        } while (banQueue.length != 0);
      };
      BanFunction();
    }
    if (banQueue.length == 0) {
      console.log(
        `\nFinished. ${banTotal} users were banned with reason: ${globals.reason}\nPress CTRL+C to exit.`
      );
    }
  });
}
