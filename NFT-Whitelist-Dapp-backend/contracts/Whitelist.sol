// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

error Whitelist__MaxNumberOfWhitelistedAddressCompleted();

contract Whitelist {
    // maximun of possible whitelist address
    // mapping to check if the address is already whitelisted
    // to see number of already whitelisted address

    uint8 public maxWhitelistedAddress;

    uint8 public numAlreadyWhitelisted;

    mapping(address => bool) public checkWhitelistAddress;

    constructor(uint8 _maxWhitelistedAddress) {
        maxWhitelistedAddress = _maxWhitelistedAddress;
    }

    function addAddressToWhitelist() public {
        if (numAlreadyWhitelisted > maxWhitelistedAddress) {
            revert Whitelist__MaxNumberOfWhitelistedAddressCompleted();
        }
        require(
            !checkWhitelistAddress[msg.sender],
            "Sender has already been whitelisted"
        );

        checkWhitelistAddress[msg.sender] = true;

        numAlreadyWhitelisted += 1;
    }
}
