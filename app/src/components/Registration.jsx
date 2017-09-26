// @flow
import React, { Component } from 'react';
import VaultJson from '../contracts/Vault.json';
import competitionAbi from '../contracts/Competition.json';

const competitionAddress = '0x4BF80bdB19C1Af50744FF4DbEe3a4029BC3D494D';
const melonToken = '0x2a20ff70596e431ab26C2365acab1b988DA8eCCF';
const TERMS_AND_CONDITIONS = '0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad';
const TERMS_AND_CONDITIONS_METAMASK =
  '0x93100cc9477ba6522a2d7d5e83d0e075b167224ed8aa0c5860cfd47fa9f22797';

class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = { fundName: '', loading: 0 };
    this.handleNext = this.handleNext.bind(this);
    this.handleBack = this.handleBack.bind(this);
  }

  async componentWillMount() {
    const contract = await new this.props.web3.eth.Contract(VaultJson.abi, this.props.fundAddress);
    const fund = await contract.methods.name().call();
    this.setState({ fundName: fund });
  }

  async sign() {
    let hash = TERMS_AND_CONDITIONS;
    if (this.props.web3.currentProvider.isMetaMask) {
      hash = TERMS_AND_CONDITIONS_METAMASK;
    }
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
      this.setState({ loading: 1 });
      await contract.methods
        .registerForCompetition(this.props.fundAddress, melonToken, melonToken, 10, v, r, s)
        .send({ from: this.props.account });
      this.props.updateState('step', 3);
    } catch (err) {
      this.props.updateState('errorMessage', 'Registration Failed. Try again');
      this.setState({ loading: 0 });
    }
  }

  handleBack(event) {
    event.preventDefault();
    this.props.updateState('step', 1);
  }
  render() {
    return (
      <form onSubmit={this.handleNext}>
        {this.state.loading === 1 && (
          <div className="alert alert-info" role="alert">
            <b>Please wait</b>, your registration is being processed
          </div>
        )}
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
