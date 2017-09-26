// @flow
import React, { Component } from 'react';
import VaultJson from '../contracts/Vault.json';

class Start extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.updateState('fundAddress', event.target.value);
    this.props.updateState('errorMessage');
  }

  async handleSubmit(event) {
    event.preventDefault();
    try {
      const contract = await new this.props.web3.eth.Contract(
        VaultJson.abi,
        this.props.fundAddress,
      );
      const fundManager = await contract.methods.owner().call();
      if (fundManager !== this.props.account) throw new Error('Invalid Account');
      this.props.updateState('step', 2);
    } catch (err) {
      this.props.updateState(
        'errorMessage',
        'Error! Please make sure you entered a valid Fund address and you are its manager. Also make sure you are connected to a Kovan node',
      );
    }
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label htmlFor="address">Enter your Fund Address</label>
        <input
          type="text"
          id="address"
          className="form-control"
          value={this.props.fundAddress}
          onChange={this.handleChange}
          required
        />
        <input type="submit" className="btn btn-info" value="Submit" />
      </form>
    );
  }
}

export default Start;
