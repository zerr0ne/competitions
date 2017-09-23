import React, { Component } from 'react';
import VaultJson from '../contracts/Vault.json';
const competitionAddress = '0xE87F3F1c7081238e51E04cCF14cf10d567993DED';
const melonToken = '0x2a20ff70596e431ab26C2365acab1b988DA8eCCF';
const TERMS_AND_CONDITIONS = '0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad';
const abi = [{"constant":true,"inputs":[],"name":"TERMS_AND_CONDITIONS","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"fund","type":"address"},{"name":"depositAsset","type":"address"},{"name":"payoutAsset","type":"address"},{"name":"depositQuantity","type":"uint256"},{"name":"v","type":"uint8"},{"name":"r","type":"bytes32"},{"name":"s","type":"bytes32"}],"name":"registerForCompetition","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"maxDepositQuantity","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"endTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"prizeMoneyAsset","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMelonAsset","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"maxHopefulsNumber","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"startTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"prizeMoneyQuantity","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MELON_ASSET","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MELON_CONTRACT","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MAX_CONTRIBUTION_DURATION","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"hopefuls","outputs":[{"name":"fund","type":"address"},{"name":"manager","type":"address"},{"name":"isCompeting","type":"bool"},{"name":"depositAsset","type":"address"},{"name":"payoutAsset","type":"address"},{"name":"depositQuantity","type":"uint256"},{"name":"payoutQuantity","type":"uint256"},{"name":"finalSharePrice","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"v","type":"uint8"},{"name":"r","type":"bytes32"},{"name":"s","type":"bytes32"}],"name":"termsAndConditionsAreSigned","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"melonport","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"ofMelonAsset","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];

class Registration extends Component {

  constructor(props) {
    super(props);
    this.state = {fundName: ''};
    this.handleNext = this.handleNext.bind(this);
    this.handleBack = this.handleBack.bind(this);
  }

  async sign() {
    const hash = await this.props.web3.utils.soliditySha3(
      '\x19Ethereum Signed Message:\n32',
      TERMS_AND_CONDITIONS
    );
    let sig = await this.props.web3.eth.sign(hash, this.props.account);
    sig = sig.substr(2, sig.length);
    let r = '0x' + sig.substr(0, 64);
    let s = '0x' + sig.substr(64, 64);
    let v = parseFloat(sig.substr(128, 2)) + 27;
    return {r, s, v};
  }

  async handleNext(event) {
    event.preventDefault();
    try {
      const contract = await new this.props.web3.eth.Contract(
        abi, competitionAddress
      );
      let {r, s, v} = await this.sign();
      //Currently works even when transactions fails with bad instruction
      await contract
      .methods.registerForCompetition(
        this.props.vaultAddress, melonToken, melonToken, 10, v, r, s
      ).send({from: this.props.account});
      this.props.updateState('step', 3);
    }
    catch(err) {
      console.log(err);
      this.props.updateState('errorMessage', 'Registration Failed. Try again');
    }
  }

  handleBack(event) {
    event.preventDefault();
    this.props.updateState('step', 1);
  }

  async componentDidMount() {
    const contract = await new this.props.web3.eth.Contract(
      VaultJson.abi, this.props.vaultAddress
    );
    let fund = await contract.methods.name().call();
    this.setState({fundName: fund});
  }

  render() {
    return (
      <form onSubmit={this.handleNext}>
        <h3>Fund Name : {this.state.fundName}</h3>
        <label>
          Terms and Conditions
        </label>
        <p>Some Placeholder</p>
        <input type="checkbox" name="terms" required/>I have read the terms<br/>
        <input type="submit" className="btn btn-info" value="Submit"/>
        <input type="button" onClick={this.handleBack} className="btn btn-secondary" value="Back"/>
      </form>
    );
  }
}

export default Registration;
