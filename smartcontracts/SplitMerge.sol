// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.4.20;
pragma experimental ABIEncoderV2;


import "./SupplyChain.sol";

contract SplitMergeFactory {

    // Requires experimental encoder to have a struct array as input
    // Can change to a mapping (string => uint) but the input would also need to include
    // a list of descriptions
    struct OutputMeatTokens {
        string description;
        uint quantity;
    }

    address private owner;
    address[] private outputs;

    constructor() public {
        owner = msg.sender;
    }

    function splitMerge(address[] inputs, OutputMeatTokens[] outputInfo) public {
        disableInputs(inputs);
        for (uint i = 0; i < outputInfo.length; i++) {
            for (uint j = 0; j < outputInfo[i].quantity; j++) {
                address token = address(
                    new MeatOwnerControl(
                        outputInfo[i].description, 
                        inputs
                    ));
                // update the minting if the constructor of SupplyChain changes
                outputs.push(token);
            }
        }
    }

    function disableInputs(address[] inputs) private {
        for (uint i = 0; i < inputs.length; i++) {
            SupplyChain(inputs[i]).disableToken();
            // Make sure the reference to the token contract works and disable token is implmeneted
            // to check that the sender is this contract or a retailer that sold the product
        }
    }

    function disable() public restricted {
        
    }

    modifier restricted() {
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