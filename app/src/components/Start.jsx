// @flow
import React, { Component } from 'react';

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
    if (this.props.web3.utils.isAddress(this.props.fundAddress)) {
      this.props.updateState('step', 2);
    } else {
      this.props.updateState(
        'errorMessage',
        'Error! Please make sure you entered a valid Fund address. Also make sure you are connected to a Mainnet node',
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
