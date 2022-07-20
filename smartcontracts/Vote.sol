// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;


/// @title Contract to agree on the lunch venue
contract Voting{

    struct Vote {
        uint grade;
    }

    enum voteState {create, open, end}                   //voting state
    uint public numVotes = 0;
    uint grade_total = 0;
    address public manager;                     //Manager

    mapping (address => Vote) private votes;       //List of vote grade 
    voteState public state = voteState.create; 
    uint256 startingBlock = 0; 
    uint public result_grade = 0;
    // block limit used for timeout
    uint blocklimit  = 100;

    // Creates a new lunch venue contract
    constructor () {
        manager = msg.sender; //Set contract creator as manager 
        startingBlock = block.number;
    }


    // @notice manager force contract to enter voting phase
    // @return true if currectly transfered to voting phase
    function startVoting() public restricted votingCreate returns (bool){
        if(state == voteState.create){
            state = voteState.open;
            return true;
        } else{
            return false;
        }
    }

    /// @return validVote Is the vote valid? or trigger final result if 10 regulator has voted or block limit exceed
    function doVote(uint grade, uint256 validation_key) public votingOpen returns (bool validVote){
        validVote = false;                              //Is the vote valid?
        if(block.number > startingBlock + blocklimit){
            finalResult();
            state = voteState.end;   
            return validVote; 
        } 
        if (validation_key == 1)  { //regulator has the key? (used 1 as the key for simplicity)
            if(votes[msg.sender].grade == 0){ // check if the sender has voted before
                numVotes = numVotes+1;
                grade_total = grade + grade;
            }else{
                grade_total = grade_total + grade - votes[msg.sender].grade;
            }
            votes[msg.sender].grade = grade;
            validVote = true;
        }   

        if (numVotes > 4 ) { //Quorum is met
            finalResult(); 
        }
        return validVote; 
    }

    /// @notice Determine winner venue
    /// @dev If top 2 venues have the same no of votes, final result depends on vote order
    function finalResult() private{ 
        result_grade = grade_total / numVotes;
        state = voteState.end; //Voting is now closed
    }

    ///@notice function force all functions to end
    function forceDisable() public restricted notdisabled {
        state = voteState.end;
    }

    modifier notdisabled() {
        require(state != voteState.end, "Contract has ended");
        _;
    }
    /// @notice Only manager can do
    modifier restricted() {
        require (msg.sender == manager, "Can only be executed by the manager"); 
        _;
    }

    /// @notice Only when voting is still open
    modifier votingOpen() {
        require(state == voteState.open, "Can vote only while voting is open."); 
        _;
    } 
    
    /// @notice only when voting is not open
    modifier votingCreate() {
        require(state == voteState.create, "Currently not in create mode"); 
        _;
    } 


}
