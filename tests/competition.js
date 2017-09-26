const Web3 = require('web3');
const chai = require('chai');
const fs = require('fs');

const assert = chai.assert;
const abi = JSON.parse(fs.readFileSync('./out/Competition.abi', 'utf8'));
const bin = fs.readFileSync('./out/Competition.bin', 'utf8');
const TERMS_AND_CONDITIONS = '0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad';
const MELON_ASSET = '0x2a20ff70596e431ab26c2365acab1b988da8eccf';

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

describe('Competition', () => {
  let defaultAccount;
  let contract;
  before('Deploy contract', async () => {
    defaultAccount = (await web3.eth.getAccounts())[0];
    contract = await new web3.eth.Contract(abi)
      .deploy({
        data: bin,
        arguments: [MELON_ASSET],
      })
      .send({ from: defaultAccount, gas: 1000000 });
  });

  it('Check if contract initialised', async () => {
    assert.equal(await contract.methods.MAX_CONTRIBUTION_DURATION().call(), 4 * 7 * 24 * 3600);
    assert.equal(await contract.methods.TERMS_AND_CONDITIONS().call(), TERMS_AND_CONDITIONS);
  });

  it('Check if Registration leads to Hopeful Entry', async () => {
    let sig = await web3.eth.sign(TERMS_AND_CONDITIONS, defaultAccount);
    sig = sig.substr(2, sig.length);
    const r = `0x${sig.substr(0, 64)}`;
    const s = `0x${sig.substr(64, 64)}`;
    const v = parseFloat(sig.substr(128, 2)) + 27;
    // MELON_ASSET as Dummy for Fund Address
    await contract.methods
      .registerForCompetition(MELON_ASSET, MELON_ASSET, MELON_ASSET, 20, v, r, s)
      .send({ from: defaultAccount, gas: 1000000 });
    const hopeful = await contract.methods.hopefuls(0).call();
    assert.equal(hopeful.manager, defaultAccount);
  });
});
