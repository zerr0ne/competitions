var Web3 = require('web3');
var chai = require('chai');
var fs = require('fs');
var assert = chai.assert;
var abi = JSON.parse(fs.readFileSync('./out/Competition.abi', 'utf8'));
var bin = fs.readFileSync('./out/Competition.bin', 'utf8');
const TERMS_AND_CONDITIONS = '0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad';
const MELON_ASSET = '0x2a20ff70596e431ab26c2365acab1b988da8eccf';

web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

describe('Competition', function() {

  let defaultAccount;
  let contract;
  before(function(){
    return web3.eth.getAccounts()
    .then(function(accounts) {
      defaultAccount = accounts[0];
      contract = new web3.eth.Contract(abi);
      return contract.deploy({
          data: bin,
          arguments: [MELON_ASSET]
      }).send({from: defaultAccount, gas:1000000});
    })
    .then(function(result) {
      contract = result;
    })
  })

  it('Check if Registration leads to Hopeful Entry', function() {
    let hash = web3.utils.soliditySha3('\x19Ethereum Signed Message:\n32', TERMS_AND_CONDITIONS);
    return web3.eth.sign(hash, defaultAccount)
    .then(function(sig) {
      sig = sig.substr(2, sig.length);
      let r = '0x' + sig.substr(0, 64);
      let s = '0x' + sig.substr(64, 64);
      let v = parseFloat(sig.substr(128, 2)) + 27;
      //MELON_ASSET as Dummy for Fund Address
      return contract.methods.registerForCompetition(
        MELON_ASSET, MELON_ASSET, MELON_ASSET, 20, v, r, s
      )
      .call({from: defaultAccount});
    })
    .then(function(result) {
      return contract.methods.hopefuls(0).call();
    })
    .then(function(hopeful) {
      assert.equal(hopeful[1], defaultAccount);
    })
  });
});
