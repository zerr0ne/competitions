pragma solidity ^0.4.13;

import "ds-test/test.sol";

import "./Competition.sol";

contract CompetitionTest is DSTest {
    Competition competition;

    function setUp() {
        //competition = new Competition();
    }

    function testFail_basic_sanity() {
        assertTrue(false);
    }

    function test_basic_sanity() {
        assertTrue(true);
    }
}
