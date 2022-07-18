// SPDX-License-Identifier: UNLICENSED

// pragma solidity ^0.8.0;
pragma solidity ^0.4.20; // this version works apparently... following https://eips.ethereum.org/EIPS/eip-721


/// @title ERC-165 Standard Interface Detection
/// @dev Reference https://eips.ethereum.org/EIPS/eip-165
interface ERC165 {
    function supportsInterface(bytes4 interfaceID) external view returns (bool);
}



/// contract MeatNFT is ERC165, ERC721, ERC721Enumerable, ERC721Metadata, supportsInterface {
contract MeatNFT is ERC165 {

    /// @dev ERC-165 interface signature for itself
    bytes4 constant InterfaceSignature_ERC165 = 
        bytes4(keccak256('supportsInterface(bytes4)'));

    /// @dev ERC-165 (current draft) interface signature for ERC721
    bytes4 constant InterfaceSignature_ERC721 =
        bytes4(keccak256('name()')) ^
        bytes4(keccak256('symbol()')) ^
        bytes4(keccak256('balanceOf(address)')) ^
        bytes4(keccak256('ownerOf(uint256)')) ^
        bytes4(keccak256('approve(address,uint256)')) ^
        bytes4(keccak256('transfer(address,uint256)')) ^
        bytes4(keccak256('transferFrom(address,address,uint256)')) ^
        bytes4(keccak256('tokensOfOwner(address)')) ^
        bytes4(keccak256('tokenMetadata(uint256,string)'));

    /// @notice Query if a contract implements an interface that's supported by this contract
    /// @return 'true' for interfact signatures of ERC-165 or ERC-721 and not 0xffffffff
    function supportsInterface(bytes4 interfaceID) external view returns (bool) {
        return ((interfaceID == InterfaceSignature_ERC165) || (interfaceID == InterfaceSignature_ERC721)) && (interfaceID != 0xffffffff);
    }

}

contract MeatOwnerControl is MeatNFT {
    string public description;
    address[] public sources;

    constructor (string descr, address[] inputs) {
        description = descr;
        sources = inputs;
    }
}

contract SupplyChain is MeatOwnerControl {


    function disableToken() public {
        // check if the splitmerge or retailer is calling it and then selfdestruct
    }
}