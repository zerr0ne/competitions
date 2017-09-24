// @flow
import React, { Component } from 'react';
import VaultJson from '../contracts/Vault.json';
import competitionAbi from '../contracts/Competition.json';

const competitionAddress = '0xE87F3F1c7081238e51E04cCF14cf10d567993DED';
const melonToken = '0x2a20ff70596e431ab26C2365acab1b988DA8eCCF';
const TERMS_AND_CONDITIONS = '0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad';

class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = { fundName: '' };
    this.handleNext = this.handleNext.bind(this);
    this.handleBack = this.handleBack.bind(this);
  }

  async componentWillMount() {
    const contract = await new this.props.web3.eth.Contract(VaultJson.abi, this.props.vaultAddress);
    const fund = await contract.methods.name().call();
    this.setState({ fundName: fund });
  }

  async sign() {
    const hash = await this.props.web3.utils.soliditySha3(
      '\x19Ethereum Signed Message:\n32',
      TERMS_AND_CONDITIONS,
    );
    let sig = await this.props.web3.eth.sign(hash, this.props.account);
    sig = sig.substr(2, sig.length);
    const r = `0x${sig.substr(0, 64)}`;
    const s = `0x${sig.substr(64, 64)}`;
    const v = parseFloat(sig.substr(128, 2)) + 27;
    return { r, s, v };
  }

  async handleNext(event) {
    event.preventDefault();
    try {
      const contract = await new this.props.web3.eth.Contract(competitionAbi, competitionAddress);
      const { r, s, v } = await this.sign();
      // Currently works even when transactions fails with bad instruction
      await contract.methods
        .registerForCompetition(this.props.vaultAddress, melonToken, melonToken, 10, v, r, s)
        .send({ from: this.props.account });
      this.props.updateState('step', 3);
    } catch (err) {
      this.props.updateState('errorMessage', 'Registration Failed. Try again');
    }
  }

  handleBack(event) {
    event.preventDefault();
    this.props.updateState('step', 1);
  }
  render() {
    return (
      <form onSubmit={this.handleNext}>
        <h3>Fund Name : {this.state.fundName}</h3>
        <label htmlFor="terms">Terms and Conditions</label>
        <p>Some Placeholder</p>
        <input type="checkbox" id="terms" name="terms" required />I have read the terms<br />
        <input type="submit" className="btn btn-info" value="Submit" />
        <input type="button" onClick={this.handleBack} className="btn btn-secondary" value="Back" />
      </form>
    );
  }
}

export default Registration;
