const Web3 = require("web3");
const fs = require("fs");
const config = require("./config");
const Datastore = require("nedb");

const db = new Datastore({ filename: `${__dirname  }/events.db`, autoload: true });
const competitionAbi = JSON.parse(
  fs.readFileSync(`${__dirname}/../out/Competition.abi`, "utf8"),
);
const fundAbi = require("@melonproject/protocol/build/contracts/Fund.json").abi;

const web3Main = new Web3(`ws://localhost:${config.mainPort}`);
const web3Kovan = new Web3(`ws://localhost:${config.kovanPort}`);

async function run() {
  const competition = await new web3Main.eth.Contract(
    competitionAbi,
    config.competitionAddress,
  );
  competition.events.Register().on("data", async event => {
    // No need to include in try block since it fails if fundAddress is invalid, no need to backlog
    // But should be handled in later versions
    const fund = await new web3Kovan.eth.Contract(
      fundAbi,
      event.returnValues.fund,
    );
    try {
      const sharePrice = await fund.methods.calcSharePrice().call();
      await competition.methods
        .attestForHopeful(event.returnValues.withId, sharePrice)
        .send({ from: config.mainUnlockedAddress });
    } catch (err) {
      db.insert(event);
    }
  });
}
run();
