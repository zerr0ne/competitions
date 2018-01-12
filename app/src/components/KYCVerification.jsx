// @flow
import React, { Component } from 'react';
import simpleCertifierAbi from '../contracts/SimpleCertifier.json';

const picopsAddress = '0xc44F7d71d1a9E5221E0c7b58b73109457251e4Dc';

class KYCVerification extends Component {
  constructor(props) {
    super(props);
    this.state = { contract: '' };
    this.handleBack = this.handleBack.bind(this);
    this.interval = null;
  }

  async componentWillMount() {
    const contract = await new this.props.web3.eth.Contract(simpleCertifierAbi, picopsAddress);
    this.setState({ contract });
    this.interval = setInterval(this.checkVerified.bind(this), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  async checkVerified() {
    const verified = await this.state.contract.methods
      .certified(this.props.account)
      .call({ from: this.props.account });
    if (verified === true) {
      this.props.updateState('step', 3);
    }
  }

  handleBack(event) {
    event.preventDefault();
    this.props.updateState('step', 1);
  }

  render() {
    return (
      <form onSubmit={this.handleNext}>
        <h3>PICOPS KYC Verification</h3>
        <div>
          <label htmlFor="number"><b>Status:</b> <span className="red-text">Not Verified</span></label>
        </div>
        <p><a href="https://picops.parity.io">Click here</a> to register for PICOPS KYC Verification</p>
        <input type="button" onClick={this.handleBack} className="btn btn-secondary" value="Back" />
      </form>
    );
  }
}

export default KYCVerification;
