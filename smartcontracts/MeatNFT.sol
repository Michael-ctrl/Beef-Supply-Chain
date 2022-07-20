// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MeatNFT is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct MeatInfo {
        string description;
        string location;
        uint dateCreated;
        uint weight;
        uint grade;
        bool voted;
    }

    struct Node {
        bytes32 name;     // name of node
        bytes32 parent;   // parent node’s path
        bytes32 data;     // node’s data
        bytes32[] nodes;  // list of linked nodes’ paths
    }
/*
    mapping(bytes32 => Node) nodes;
function get(bytes32 _name, bytes32 _parent) public view returns (bytes32, bytes32, bytes32, bytes32[]) {
    Node storage node = nodes[keccak256(_parent, _name)];
    return (node.name, node.parent, node.data, node.nodes);
}
    
function add(bytes32 _name, bytes32 _parent, bytes32 _data) public {
    require(_name.length > 0);
    bytes32 path = keccak256(_parent, _name);
    nodes[path] = Node({
        name: _name, 
        parent: _parent, 
        data: _data, 
        nodes: new bytes32[](0)
    });
    nodes[_parent].nodes.push(path);
}
function update(bytes32 _name, bytes32 _parent, bytes32 _data) public {
    bytes32 path = keccak256(_parent, _name);
    Node storage node = nodes[path];
    node.data = _data;
}
function remove(bytes32 _name, bytes32 _parent) public {
    bytes32 path = keccak256(_parent, _name);
    // allow to remove leaves (node without linked nodes)
    require(nodes[path].nodes.length == 0);
    // removes from nodes
    delete nodes[path];
    
    // removes from parent list of nodes
    bytes32[] storage childs = nodes[_parent].nodes;
    for (uint256 i = getIndex(childs, path); i < childs.length - 1; i++) {
        childs[i] = childs[i + 1];
    }
    delete childs[childs.length - 1];
    childs.length--;
}
function getIndex(bytes32[] childs, bytes32 _path) pure internal returns (uint256) {
    for (uint256 i = 0; i < childs.length; i++) {
        if (_path == childs[i]) {
            return i;
        }
    }
    return childs.length - 1;
}*/

    struct History {}


    mapping (uint256 => MeatInfo) public idToInfo;
    mapping (uint256 => History) public idToHistory;

    constructor() public ERC721("MeatNFT", "BFT") { }

    function (address player, string memory tokenURI)
        public
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(player, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    // Check if tokenID is owned by msg.sender and then append to the voting list
    function intiateVoting(uint256 tokenId) {
        ownerOf()
        idToInfo[tokenId].voted = true;
    }

    function getGradingData(uint256 tokenId, uint grade) {

    }

    // 
    function splitMerge() {

    }

    // some edit data functions

    function mintMeatToken (lots of data) {

    }

}