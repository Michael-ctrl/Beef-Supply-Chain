// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

//import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MeatNFT is ERC721URIStorage, ERC721Enumerable, AccessControlEnumerable {
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

    // Struct for getting required outputs of splitMerge
    struct OutputMeat {
        string description;
        string location;
        uint quantity;
        uint weight;
    }

    // Tree data structure to hold the history of a tokens ownership
    mapping (uint256 => address[]) ownersHistory;
    mapping (uint256 => uint256[]) sourcesHistory;

    struct viewHistory {
        uint256 tokenId;
        uint256 child;
        address[] owners;
        uint8[] sources;
    }
    uint8[] empty = new uint8[](0);

    mapping (uint256 => MeatInfo) public idToInfo;

    event Mint(string tokenURI, address to);

    bytes32 private constant MINTER_ROLE = keccak256("MINTER_ROLE"); // A role that allows individuals to mint NFTs
    bytes32 private constant BURNER_ROLE = keccak256("BURNER_ROLE"); // A role that allows individuals to burn NFTs
    bytes32 private constant VOTER_ROLE = keccak256("VOTER_ROLE"); // A role that allows individuals to vote on grading
    bytes32 private constant PROCESSOR_ROLE = keccak256("PROCESSOR_ROLE"); // A role that allows individuals to process NFT's into new NFT's

    constructor() ERC721("MeatNFT", "BFT") {
        // Grant the contract deployer the default admin role
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);

        // make meat NFTs start at an index of 1
        _tokenIds.increment();
    }

    function createMeat(
        string memory _description, 
        string memory _location, 
        uint _weight
    ) public onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 newItemId = _tokenIds.current();
        string memory tokenURI = string(abi.encodePacked(Strings.toString(newItemId)," ",Strings.toHexString(address(this))));
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);


        emit Mint(tokenURI, msg.sender);

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

    function makeProcessor(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(PROCESSOR_ROLE, account);
    }

    // call with history empty
    function traverseHistory(
        uint256 _tokenId, 
        uint index, 
        uint256 _child, 
        viewHistory[] memory history
    ) private returns (viewHistory[] memory) {

        history[index] = (viewHistory({
            tokenId: _tokenId, 
            owners: ownersHistory[_tokenId],
            child: _child,
            sources: empty
        }));
        index++;
        for (uint i=0; i<sourcesHistory[_tokenId].length; i++) {
            history = traverseHistory(sourcesHistory[_tokenId][i], index, _tokenId, history);
            index++;
        }
        return history;
    }

    function getHistory(uint256 _tokenId, uint historySize) public returns (viewHistory[] memory) {
        require(_exists(_tokenId), 'Token does not exist');
        return traverseHistory(_tokenId, 0, 0, new viewHistory[](historySize));
    }

    // Interaction with voting contract
    Voting voting_contract;
    function requestVoting(uint256 tokenId, address voting_contract_addr) public {
        // person who can start voting needs to own the token
        require(ownerOf(tokenId) == msg.sender, "Meat voting can only be request by the NFT owner");
        voting_contract = Voting(voting_contract_addr);
        uint quorum = getRoleMemberCount(VOTER_ROLE)/2;
        voting_contract.meat_enqueue(tokenId, quorum);
        idToInfo[tokenId].voted = true;
    }
    
    function getGradingData(uint256 tokenId, uint grade) public {
        idToInfo[tokenId].grade = grade;
        idToInfo[tokenId].voted = true;
    }

    // Creates 'quantity' tokens for each outputMeat, disables the input tokens 
    // and records the transfomation in tracking history.
    //
    // Input for 'outputs' in form of [["descr", "loc", quantity(int), weight(int)],[...]]
    function splitMerge(
        uint256[] memory inputs, 
        OutputMeat[] calldata outputs
    ) public onlyRole(PROCESSOR_ROLE) returns(uint256[] memory) {
        for (uint i=0; i < inputs.length; i++) {
            require(ownerOf(inputs[i]) == msg.sender, "One of the tokens does not belong to the caller");
        }
        uint sizeOfArray = 0;
        for (uint i=0; i < inputs.length; i++) {
            _burn(inputs[i]);
            sizeOfArray += outputs[i].quantity;
        }
        uint256[] memory tokens = new uint256[](sizeOfArray); 
        uint a = 0;
        for (uint i = 0; i < outputs.length; i++) {
            for (uint j = 0; j < outputs[i].quantity; j++) {
                uint256 token = (createMeat(outputs[i].description, outputs[i].location, outputs[i].weight));
                sourcesHistory[token] = inputs;
                tokens[a] = token;
                a++;
            }
        }
        return tokens;
    }

    // Burns a token but keeps the information associated with it
    function disableToken(uint256 tokenId) public onlyRole(BURNER_ROLE) {
        _burn(tokenId);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        if (to != address(0) && from != address(0)) {
            ownersHistory[tokenId].push(to);
        }
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override(ERC721, ERC721Enumerable) {
        return super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControlEnumerable, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

}

contract Voting{
    function meat_enqueue(uint256 meatid, uint quorum) public{}
}