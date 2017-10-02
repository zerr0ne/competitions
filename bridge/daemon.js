const Web3 = require("web3");
const fs = require("fs");
const config = require("./config");

const competitionAbi = JSON.parse(
  fs.readFileSync("../out/Competition.abi", "utf8"),
);
const vaultAbi = JSON.parse(fs.readFileSync("./Vault.json", "utf8")).abi;

const web3Main = new Web3(`ws://localhost:${  config.mainPort}`);
const web3Kovan = new Web3(`ws://localhost${  config.kovanPort}`);

async function run() {
  const competition = await new web3Main.eth.Contract(
    competitionAbi,
    config.competitionAddress,
  );
  competition.events.Register().on("data", async (event) => {
    const vault = await new web3Kovan.eth.Contract(
      vaultAbi,
      event.returnValues.fund,
    );
    const sharePrice = vault.methods.calcSharePrice().call();
    await competition.methods
      .attestForHopeful(event.returnValues.withId, sharePrice)
      .send();
  });
}

run();
