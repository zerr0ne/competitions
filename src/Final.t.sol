pragma solidity ^0.4.16;

import "ds-test/test.sol";

import "./Final.sol";

contract FinalTest is DSTest {
    Final final;

    function setUp() {
        final = new Final();
    }

    function testFail_basic_sanity() {
        assertTrue(false);
    }

    function test_basic_sanity() {
        assertTrue(true);
    }
}
