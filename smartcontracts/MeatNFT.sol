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

    mapping (uint256 => MeatInfo) public idToInfo;
    mapping (uint256 => History) public idToHistory;

    constructor() public ERC721("MeatNFT", "BFT") {}

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

    // Check if tokenID is owned by msg.sender and then append to the voting 
    function intiateVoting(uint256 tokenId) {

    }
}