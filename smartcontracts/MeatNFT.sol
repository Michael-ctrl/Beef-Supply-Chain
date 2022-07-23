// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

//import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MeatNFT is ERC721URIStorage, AccessControl {
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

    // Tree data structure to hold the history of a tokens ownership
    mapping (uint256 => address[]) ownersHistory;
    mapping (uint256 => uint256[]) sourcesHistory;

    struct viewHistory {
        uint256 tokenId;
        address[] owners;
        uint256 child;
    }

    // dfs
    // call with history empty
    function traverseHistory(uint256 _tokenId, uint index, uint256 _child, viewHistory[] memory history) private returns (viewHistory[] memory){
        
        history[index] = (viewHistory({
            tokenId: _tokenId, 
            owners: ownersHistory[_tokenId],
            child: _child
        }));
        index++;
        for (uint i=0; i<sourcesHistory[_tokenId].length; i++) {
            history = traverseHistory(sourcesHistory[_tokenId][i], index, _tokenId, history);
            index++;
        }
        return history;
    }

    function getHistory(uint256 _tokenId, uint historySize) public returns (viewHistory[] memory) {
        return traverseHistory(_tokenId, 0, 0, new viewHistory[](historySize));
    }

    mapping (uint256 => MeatInfo) public idToInfo;

    bytes32 private constant MINTER_ROLE = keccak256("MINTER_ROLE"); // A role that allows individuals to mint NFTs
    bytes32 private constant BURNER_ROLE = keccak256("BURNER_ROLE"); // A role that allows individuals to burn NFTs
    bytes32 private constant VOTER_ROLE = keccak256("VOTER_ROLE"); // A role that allows individuals to vote on grading

    constructor() ERC721("MeatNFT", "BFT") {
        // Grant the contract deployer the default admin role
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
    }

    function createMeat(string memory tokenURI, string memory _description, string memory _location, uint _weight) public onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        MeatInfo memory m;
        m.description = _description;
        m.location = _location;
        m.dateCreated = block.timestamp;
        m.weight = _weight;
        m.grade = 0;
        m.voted = false;
        idToInfo[_tokenIds.current()] = m;

        ownersHistory[_tokenIds.current()] = [msg.sender];
        sourcesHistory[_tokenIds.current()] = new uint256[](0);

        _tokenIds.increment();

        

        return newItemId;
    }

    function makeMinter(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, account);
    }

    function makeBurner(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(BURNER_ROLE, account);
    }

    function makeVoter(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(VOTER_ROLE, account);
    }

    // Interaction with voting contract
    Voting voting_contract;
    function requestVoting(uint256 tokenId, address voting_contract_addr) public {
        voting_contract = Voting(voting_contract_addr);
        voting_contract.meat_enqueue(tokenId);
        idToInfo[tokenId].voted = true;
    }
    
    function getGradingData(uint256 tokenId, uint grade) public {
        idToInfo[tokenId].grade = grade;
    }
/*
    function splitMerge(uint256[] inputs, ) {
        _mint
    }*/

    /*
    // Check if tokenID is owned by msg.sender and then append to the voting list
    function intiateVoting(uint256 tokenId) public{
        ownerOf()
        idToInfo[tokenId].voted = true;
    }

    function getGradingData(uint256 tokenId, uint grade) public{
        
    }

    // 
    

    // some edit data functions
    */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

}

contract Voting{
    function meat_enqueue(uint256 meatid) public{}
}
