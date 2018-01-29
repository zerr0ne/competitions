pragma solidity ^0.4.13;

import './SimpleCertifier.sol';

contract TestCertifier is SimpleCertifier {

  function certified(address _who) constant returns (bool) { return true; }

}
