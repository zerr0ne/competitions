import React, { Component } from 'react';
import './App.css';
import Start from './components/Start';
import Registration from './components/Registration';
import Confirmation from './components/Confirmation';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      vaultAddress: '',
      errorMessage: '',
      step: 1
    }
    this.updateState = this.updateState.bind(this);
  }

  updateState(variable, value) {
    this.setState({[variable]: value});
  }

  showForm() {
    switch (this.state.step) {
      default:
        return <Start updateState = {this.updateState}
                      vaultAddress = {this.state.vaultAddress}
                      account = {this.props.account}
                      web3 = {this.props.web3}  />
      case 2:
        return <Registration updateState = {this.updateState}
                             vaultAddress = {this.state.vaultAddress}
                             account = {this.props.account}
                             web3 = {this.props.web3}  />
      case 3:
        return <Confirmation />
    }
  }

  showError() {
    if (this.state.errorMessage) {
      return (
        <div className="alert alert-warning" role="alert">
          {this.state.errorMessage}
        </div>
      )
    }
  }

  render() {
    //From tommymarshall/react-multi-step-form
    let progressStyle = {
      width : (this.state.step / 3 * 100) + '%'
    }

    return (
      <div className="ribbon">
        <div className="container">
          <h2 className="title">Melon Competition Registration</h2>
          <div className="card">
            <div className="card-block">
              <div className="row">
                <div className="col-12">
                  <div className="progress">
                    <div className="progress-bar bg-info" role="progressbar" style={progressStyle}></div>
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
