/* eslint-disable no-underscore-dangle */
const Web3 = require("web3");
const fs = require("fs");
const config = require("./config");
const Datastore = require("nedb");

const db = new Datastore({ filename: "events.db", autoload: true });
const competitionAbi = JSON.parse(
  fs.readFileSync("../out/Competition.abi", "utf8"),
);
const fundAbi = require("@melonproject/protocol/build/contracts/Fund.json").abi;

const web3Main = new Web3(`ws://localhost:${config.mainPort}`);
const web3Kovan = new Web3(`ws://localhost:${  config.kovanPort}`);

// Run this script periodically to process events that have not been processed unexpectedly.
async function processBacklogEvents() {
  const competition = await new web3Main.eth.Contract(
    competitionAbi,
    config.competitionAddress,
  );
  db.find({}, (err, events) => {
    events.forEach(async (event) => {
      const fund = await new web3Kovan.eth.Contract(
        fundAbi,
        event.returnValues.fund,
      );
      const sharePrice = await fund.methods.calcSharePrice().call();
      await competition.methods
        .attestForHopeful(event.returnValues.withId, sharePrice)
        .send({ from: config.mainUnlockedAddress });
      db.remove({ _id: event._id });
    });
  });
}
processBacklogEvents();
