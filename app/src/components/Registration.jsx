// @flow
import React, { Component } from 'react';
import competitionAbi from '../contracts/Competition.json';

const competitionAddress = '0x366ce0e3dF87E0d39a65CB00059F4BF6cB70E699';
const melonToken = '0x2a20ff70596e431ab26C2365acab1b988DA8eCCF';
const TERMS_AND_CONDITIONS = '0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad';
const TERMS_AND_CONDITIONS_METAMASK =
  '0x93100cc9477ba6522a2d7d5e83d0e075b167224ed8aa0c5860cfd47fa9f22797';

class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: 0, contract: '' };
    this.handleNext = this.handleNext.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.interval = null;
  }

  async componentWillMount() {
    const contract = await new this.props.web3.eth.Contract(competitionAbi, competitionAddress);
    this.setState({ contract });
    // Interval started from this point itself to check if user has already registered before
    this.interval = setInterval(this.checkCompeting.bind(this), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
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
      const { r, s, v } = await this.sign();
      this.setState({ loading: 1 });
      await this.state.contract.methods
        .registerForCompetition(this.props.fundAddress, melonToken, melonToken, 10, v, r, s)
        .send({ from: this.props.account });
    } catch (err) {
      this.props.updateState('errorMessage', 'Registration Failed. Try again');
      this.setState({ loading: 0 });
    }
  }

  handleBack(event) {
    event.preventDefault();
    this.props.updateState('step', 2);
  }

  // Check if the registration has been attested and user is Competing
  async checkCompeting() {
    // To avoid crashes from weird web3 exceptions
    try {
      const hopefulId = await this.state.contract.methods
        .registrantToHopefulIds(this.props.account)
        .call({ from: this.props.account });
      // Check for valid mapping
      if (hopefulId.exists === true) {
        const hopeful = await this.state.contract.methods
          .hopefuls(hopefulId.id)
          .call({ from: this.props.account });
        if (hopeful.isCompeting === true) {
          this.setState({ loading: 0 });
          this.props.updateState('step', 4);
        }
      }
    } catch (err) {
      // Ignore
    }
  }

  render() {
    return (
      <form onSubmit={this.handleNext}>
        {this.state.loading === 1 && (
          <div className="alert alert-info" role="alert">
            <b>Please wait</b>, your registration is being processed
          </div>
        )}
        <b>Fund Address : {this.props.fundAddress}</b><br /><br />
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
