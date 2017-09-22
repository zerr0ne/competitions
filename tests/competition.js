var Web3 = require('web3');
var chai = require('chai');
var fs = require("fs");
var assert = chai.assert;

web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var defaultAccount;
web3.eth.getAccounts()
.then(function(accounts) {
  defaultAccount = accounts[0];
})

var file = JSON.parse(fs.readFileSync("./out/Final.sol.json", "utf8"));
console.log(file);
describe('Array', function() {
  it('should start empty', function() {
    return web3.eth.getGasPrice()
    .then(function(n) {
      console.log(n);
    })
  });
});
