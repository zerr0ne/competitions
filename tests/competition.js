const Web3 = require('web3');
const chai = require('chai');
const fs = require('fs');

const assert = chai.assert;
const abi = JSON.parse(fs.readFileSync('./out/Competition.abi', 'utf8'));
const bin = fs.readFileSync('./out/Competition.bin', 'utf8');
const smsAbi = JSON.parse(fs.readFileSync('./out/ProofOfSMS.abi', 'utf8'));
const smsBin = fs.readFileSync('./out/ProofOfSMS.bin', 'utf8');
const TERMS_AND_CONDITIONS = '0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad';
const MELON_ASSET = '0x2a20ff70596e431ab26c2365acab1b988da8eccf';

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const sign = async (account) => {
  let sig = await web3.eth.sign(TERMS_AND_CONDITIONS, account);
  sig = sig.substr(2, sig.length);
  const r = `0x${sig.substr(0, 64)}`;
  const s = `0x${sig.substr(64, 64)}`;
  const v = parseFloat(sig.substr(128, 2)) + 27;
  return { r, s, v };
}

describe('Competition', () => {
  let accounts;
  let contract;
  let sms;
  before('Deploy contract', async () => {
    accounts = await web3.eth.getAccounts();
    sms = await new web3.eth.Contract(smsAbi)
      .deploy({
        data: smsBin,
        arguments: [],
      })
      .send({ from: accounts[0], gas: 2000000 });
    contract = await new web3.eth.Contract(abi)
      .deploy({
        data: bin,
        arguments: [MELON_ASSET, accounts[0], sms.options.address, 600, 80],
      })
      .send({ from: accounts[0], gas: 2000000 });
  });
  it('Check if contract initialised', async () => {
    assert.equal(await contract.methods.MAX_CONTRIBUTION_DURATION().call(), 4 * 7 * 24 * 3600);
    assert.equal(await contract.methods.TERMS_AND_CONDITIONS().call(), TERMS_AND_CONDITIONS);
  });

  it('Check if Registration leads to Hopeful Entry', async () => {
    const { r, s, v } = await sign(accounts[0]);
    // MELON_ASSET as Dummy for Fund Address
    await sms.methods
      .certify(accounts[0])
      .send({ from: accounts[0], gas: 1000000 });
    await contract.methods
      .registerForCompetition(MELON_ASSET, MELON_ASSET, MELON_ASSET, 20, v, r, s)
      .send({ from: accounts[0], gas: 1000000 });
    const hopeful = await contract.methods.hopefuls(0).call();
    assert.equal(hopeful.manager, accounts[0]);
  });

  it('Check if Registration fails on non-verified SMS', async () => {
    let error;
    try {
      const { r, s, v } = await sign(accounts[1]);
      await contract.methods
        .registerForCompetition(MELON_ASSET, MELON_ASSET, MELON_ASSET, 20, v, r, s)
        .send({ from: accounts[1], gas: 1000000 });
    }
    catch (err) {error = err;}
    assert.isDefined(error, 'Exception must be thrown');
  });

  it('Check if isCompeting is set to true on Attestation', async () => {
    await contract.methods
      .attestForHopeful(0, 200)
      .send({ from: accounts[0], gas: 1000000 });
    const hopeful = await contract.methods.hopefuls(0).call();
    assert.isTrue(hopeful.isCompeting);
  });
});
