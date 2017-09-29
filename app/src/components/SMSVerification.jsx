// @flow
import React, { Component } from 'react';
import SMSVerificationAbi from '../contracts/SMSVerification.json';

const smsContractAddress = '0x1eb05C6129E09D9969D5D494bb01B8379DD49fFF';

class SMSVerification extends Component {
  constructor(props) {
    super(props);
    this.state = { contract: '', stage: 1, number: '', code: '', fee: 0, loading: '' };
    this.handleNumberChange = this.handleNumberChange.bind(this);
    this.handleCodeChange = this.handleCodeChange.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handleBack = this.handleBack.bind(this);
  }

  async componentWillMount() {
    const contract = await new this.props.web3.eth.Contract(SMSVerificationAbi, smsContractAddress);
    const fee = await contract.methods.fee().call();
    this.setState({ fee });
    this.setState({ contract });
  }

  componentWillUnMount() {
    clearInterval(this.interval);
  }
  //  Fee for SMSVerification
  async payFee() {
    try {
      this.setState({ loading: 'Your transaction is being processed. This may take a while' });
      await this.state.contract.methods
        .request()
        .send({ from: this.props.account, value: this.state.fee });
      // Todo Post to Parity's endpoint
      this.setState({ loading: '' });
      this.setState({ stage: 2 });
    } catch (err) {
      console.log(err);
      this.props.updateState('errorMessage', 'Registration Failed. Try again');
      this.setState({ loading: '' });
    }
  }

  async verifyCode() {
    this.setState({ loading: 'Your code is being verified. This may take a while' });
    try {
      const hash = this.props.web3.utils.sha3(this.state.number);
      await this.state.contract.methods
        .confirm(hash)
        .send({ from: this.props.account });
      this.interval = setInterval(this.checkVerified.bind(this), 1000);
    } catch (err) {
      console.log(err);
      this.props.updateState('errorMessage', 'Registration Failed. Try again');
      this.setState({ loading: '' });
    }
  }

  async handleNext(event) {
    event.preventDefault();
    switch (this.state.stage) {
      default:
        this.payFee();
        break;
      case 2:
        this.verifyCode();
    }
  }

  async checkVerified() {
    const verified = await this.state.contract.methods
      .certified(this.props.account)
      .call({ from: this.props.account });
    if (verified === true) {
      this.setState({ loading: '' });
      this.props.updateState('step', 3);
    }
  }

  handleNumberChange(event) {
    this.setState({ number: event.target.value });
  }

  handleCodeChange(event) {
    this.setState({ code: event.target.value });
  }

  handleBack(event) {
    event.preventDefault();
    this.props.updateState('step', 1);
  }

  render() {
    return (
      <form onSubmit={this.handleNext}>
        {this.state.loading && (
          <div className="alert alert-info" role="alert">
            <b>Please wait</b>, {this.state.loading}
          </div>
        )}
        <h3>Verify Number</h3>
        {this.state.stage === 1 && (
          <div>
            <label htmlFor="number">Enter your Phone Number</label>
            <input
              type="text"
              id="number"
              className="form-control"
              value={this.state.number}
              onChange={this.handleNumberChange}
              required
            />
          </div>
        )}
        {this.state.stage === 2 && (
          <div>
            <label htmlFor="address">Enter the code received to your phone</label>
            <input
              type="text"
              id="address"
              className="form-control"
              value={this.state.code}
              onChange={this.handleCodeChange}
              required
            />
          </div>
        )}
        <input type="submit" className="btn btn-info" value="Submit" />
        <input type="button" onClick={this.handleBack} className="btn btn-secondary" value="Back" />
      </form>
    );
  }
}

export default SMSVerification;
