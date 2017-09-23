import React, { Component } from 'react';
import VaultJson from '../contracts/Vault.json';

class Start extends Component {
  constructor(props) {
    super(props);
    this.state = {
      vaultAddress: '',
      errorMessage: '',
      step: 1
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.updateState('vaultAddress', event.target.value);
    this.props.updateState('errorMessage');
  }

  async handleSubmit(event) {
    event.preventDefault();
    try {
      const contract = await new this.props.web3.eth.Contract(
        VaultJson.abi, this.props.vaultAddress
      );
      let vaultOwner = await contract.methods.owner().call();
      if (vaultOwner !== this.props.account) throw new Error('Invalid Account');
      this.props.updateState('step', 2);
    }
    catch(err) {
      console.log(err);
      this.props.updateState('errorMessage', 'Error');
    }
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Enter your Vault Address
        </label>
        <input type="text" className="form-control" value={this.props.vaultAddress} onChange={this.handleChange} required />
        <input type="submit" className="btn btn-info" value="Submit"/>
      </form>
    );
  }
}

export default Start;
