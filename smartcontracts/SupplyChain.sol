// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;


/// @title ERC-721 Non-Fungible Token Standard
/// @dev Reference https://eips.ethereum.org/EIPS/eip-721
interface ERC721 /* is ERC165 */ {
    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
    event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);
    function balanceOf(address _owner) external view returns (uint256);
    function ownerOf(uint256 _tokenId) external view returns (address);
    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes memory data) external payable;
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable;
    function transferFrom(address _from, address _to, uint256 _tokenId) external payable;
    function approve(address _approved, uint256 _tokenId) external payable;
    function setApprovalForAll(address _operator, bool _approved) external;
    function getApproved(uint256 _tokenId) external view returns (address);
    function isApprovedForAll(address _owner, address _operator) external view returns (bool);
}

/// @title ERC-165 Standard Interface Detection
/// @dev Reference https://eips.ethereum.org/EIPS/eip-165
interface ERC165 {
    function supportsInterface(bytes4 interfaceID) external view returns (bool);
}

/// @title ERC-721 Non-Fungible Token Standard
interface ERC721TokenReceiver {
    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes memory _data) external returns(bytes4);
}

/// @title ERC-721 Non-Fungible Token Standard, optional metadata extension
interface ERC721Metadata /* is ERC721 */ {
    function name() external pure returns (string memory _name);
    function symbol() external pure returns (string memory _symbol);
    function tokenURI(uint256 _tokenId) external view returns (string memory);
}

/// @title ERC-721 Non-Fungible Token Standard, optional enumeration extension
interface ERC721Enumerable /* is ERC721 */ {
    function totalSupply() external view returns (uint256);
    function tokenByIndex(uint256 _index) external view returns (uint256);
    function tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256);
}

///contract SupplyChain is MeatOwnerControl {}

/// contract MeatNFT is ERC165, ERC721, ERC721Enumerable, ERC721Metadata, supportsInterface {
contract MeatNFT is ERC165 {
    uint256 constant con = 888;

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
    function supportsInterface(bytes4 interfaceID) external override pure returns (bool) {
        return ((interfaceID == InterfaceSignature_ERC165) || (interfaceID == InterfaceSignature_ERC721)) && (interfaceID != 0xffffffff);
    }
}

contract MeatOwnerControl is MeatNFT {

}

contract SupplyChain is MeatOwnerControl {
    string public description;
    string public location;
    uint public dateCreated;
    uint public weight;
    uint public grade;
    address[] public sources;
    address private tokenFactoryAddress;

    bool private writable;

    constructor (string memory descr, string memory loc, address[] memory inputs, uint grams) {
        description = descr;
        location = loc;
        sources = inputs;
        weight = grams;
        dateCreated = block.timestamp;
        tokenFactoryAddress = msg.sender;
        writable = true;
    }
    // TODO add a bunch of functions for editing info 
    function iamTokenTest() public returns (bool t) {
        return true;
    }

    function disableToken() external disabled {
        // check if the splitMerge is calling it
        if (msg.sender == tokenFactoryAddress) {
            writable = false;
        }
    }

    modifier disabled() {
        require (writable, "This token can't be edited or interacted with any more");
        _;
    }
}