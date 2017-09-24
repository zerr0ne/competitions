// @flow
/* eslint-disable */
import React from 'react';
import ReactDOM from 'react-dom';
import Web3 from 'web3';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

let web3;

window.addEventListener('load', async () => {
  let web3Provided;
  if (typeof web3 !== 'undefined') {
    web3Provided = new Web3(web3.currentProvider);
  } else {
    web3Provided = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  }

  const accounts = await web3Provided.eth.getAccounts();

  ReactDOM.render(
    <App web3={web3Provided} account={accounts[0]} />,
    document.getElementById('root'),
  );
});
