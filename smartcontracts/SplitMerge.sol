// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;


import "./SupplyChain.sol";

contract TokenFactory {

    struct OutputMeatTokens {
        string description;
        string location;
        uint quantity;
        uint weight;
    }

    address private owner;

    constructor() {
        owner = msg.sender;
    }

    function splitMerge(address[] calldata inputs, OutputMeatTokens[] calldata outputInfo) external returns (address[] memory tokens) {
        disableInputs(inputs);
        address[] memory outputs;
        uint a = 0;
        for (uint i = 0; i < outputInfo.length; i++) {
            for (uint j = 0; j < outputInfo[i].quantity; j++) {
                outputs[a] = mintToken(outputInfo[i].description, outputInfo[i].location, inputs, outputInfo[i].weight);
                a++;
            }
        }
        return outputs;
    }

    function disableInputs(address[] calldata inputs) private {
        for (uint i = 0; i < inputs.length; i++) {
            SupplyChain(inputs[i]).disableToken();
            // Make sure the reference to the token contract works and disable token is implmeneted
            // to check that the sender is this contract or a retailer that sold the product
        }
    }

    function mintToken(string calldata description, string calldata location, address[] memory sources, uint weight) public returns (address token) {
        return address(new SupplyChain(description, location, sources, weight));
        // update the minting if the constructor of SupplyChain changes
    }

    function mintNewTokens(string calldata description, string calldata location, uint weight, uint quantity) public {
        //address[] memory tokens = new address[](quantity);
        for (uint i = 0; i < quantity; i++) {
            mintToken(description, location, new address[] (0), weight);
        }
        //return tokens;
    }

    function disable() public admin {
        selfdestruct(payable(owner));
    }

    modifier admin() {
        require (msg.sender == owner, "Can only be executed by the owner");
        _;
    }

    // Only authorised businesses addresses should be allowed to call splitMerge
    /*modifier auth() {
        bool authorised = false;
        for (uint i = 0; i < businesses.length; i++) {
            if (msg.sender == businesses[i]) {
                authorised = true;
                break;
            }
        }
        require (authorised, "Can only be executed by authorised businesses");
        _;
    }*/
}