// @flow
import React, { Component } from 'react';
import './App.css';
import Start from './components/Start';
import SMSVerification from './components/SMSVerification';
import Registration from './components/Registration';
import Confirmation from './components/Confirmation';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fundAddress: '',
      errorMessage: '',
      step: 1,
    };
    this.updateState = this.updateState.bind(this);
  }

  updateState(variable, value) {
    this.setState({ [variable]: value });
  }

  showForm() {
    switch (this.state.step) {
      default:
        return (
          <Start
            updateState={this.updateState}
            fundAddress={this.state.fundAddress}
            account={this.props.account}
            web3={this.props.web3}
          />
        );
      case 2:
        return (
          <SMSVerification
            updateState={this.updateState}
            fundAddress={this.state.fundAddress}
            account={this.props.account}
            web3={this.props.web3}
          />
        );
      case 3:
        return (
          <Registration
            updateState={this.updateState}
            fundAddress={this.state.fundAddress}
            account={this.props.account}
            web3={this.props.web3}
          />
        );
      case 4:
        return <Confirmation />;
    }
  }

  showError() {
    if (this.state.errorMessage) {
      return (
        <div className="alert alert-warning" role="alert">
          {this.state.errorMessage}
        </div>
      );
    }
  }

  render() {
    //  From tommymarshall/react-multi-step-form
    const progressStyle = {
      width: `${this.state.step / 3 * 100}%`,
    };

    return (
      <div className="ribbon">
        <div className="container">
          <h2 className="title">Melon Competition Registration</h2>
          <div className="card">
            <div className="card-block">
              <div className="row">
                <div className="col-12">
                  <div className="progress">
                    <div
                      className="progress-bar bg-info"
                      role="progressbar"
                      style={progressStyle}
                    />
                  </div>
                  {this.showError()}
                  {this.showForm()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
