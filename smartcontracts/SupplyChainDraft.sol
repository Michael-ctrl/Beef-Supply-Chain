// SPDX-License-Identifier: UNLICENSED

// pragma solidity ^0.8.0;
pragma solidity ^0.4.20; // this version works apparently... following https://eips.ethereum.org/EIPS/eip-721

/// This solanity fail will likely need debugging. 


/// @title ERC-721 Non-Fungible Token Standard
/// @dev Reference https://eips.ethereum.org/EIPS/eip-721
interface ERC721 /* is ERC165 */ {
    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
    event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);
    function balanceOf(address _owner) external view returns (uint256);
    function ownerOf(uint256 _tokenId) external view returns (address);
    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes data) external payable;
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
    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes _data) external returns(bytes4);
}

/// @title ERC-721 Non-Fungible Token Standard, optional metadata extension
interface ERC721Metadata /* is ERC721 */ {
    function name() external pure returns (string _name);
    function symbol() external pure returns (string _symbol);
    function tokenURI(uint256 _tokenId) external view returns (string);
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
    function supportsInterface(bytes4 interfaceID) external view returns (bool) {
        return ((interfaceID == InterfaceSignature_ERC165) || (interfaceID == InterfaceSignature_ERC721)) && (interfaceID != 0xffffffff);
    }
}

contract MeatOwnerControl is MeatNFT {
    string title;

    function changeTitle(string t) public returns (bool) {
        title = t;
        return true;
    }
}