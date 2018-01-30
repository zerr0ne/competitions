// @flow
/* eslint-disable */
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Web3 from 'web3';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

window.addEventListener('load', async () => {
  let web3Provided;
  if (typeof web3 !== 'undefined') {
    web3Provided = new Web3(web3.currentProvider);
  } else {
    web3Provided = new Web3(new Web3.providers.HttpProvider('https://localhost:8545'));
  }

  const accounts = await web3Provided.eth.getAccounts();

  ReactDOM.render(
    <Router>
      <div>
        <Route path="/:fund/:manager/:r/:s/:v"
          render={(props) => <App {...props} web3={web3Provided} account={accounts[0]}/>}
        />
      </div>
    </Router>,
    document.getElementById('root'),
  );
});
