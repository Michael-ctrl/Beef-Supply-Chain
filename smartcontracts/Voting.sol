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
    SupplyChain meatnft_contract;
    //mapping for queue
    mapping(uint256 => uint256) public queue;
    uint256 queue_first = 1;
    uint256 queue_last = 0;

    //List of vote grade 
    mapping (address => Vote) private votes;      

    // starting state; 
    voteState public state = voteState.create; 
    uint256 startingBlock = 0; 
    uint public result_grade = 0;
    uint256 public current_meat = 0;
    uint blocklimit  = 100;// block limit used for timeout
    uint required_vote = 0;
    // Creates a new lunch venue contract
    constructor () {
        manager = msg.sender; //Set contract creator as manager 
        startingBlock = block.number;
    }

    // update the external function address
    function get_nftContractAddress(address addr) public {
        meatnft_contract = SupplyChain(addr);
    } 

    //  function for meat grade enqueue
    function meat_enqueue(uint256 meat, uint256 quorum) public{
        required_vote = quorum;
        queue_last += 1;
        queue[queue_last] = meat;
        if(state == voteState.create)
            startVoting();
    }

    // function for meat grade dequeue
    function dequeue() public returns (uint256 meat){
        require(queue_last >= queue_first); // check if queue is empty

        meat = queue[queue_first];
        delete queue[queue_first];
        queue_first += 1;
    }


    // @notice manager force contract to enter voting phase
    // @return true if currectly transfered to voting phase
    function startVoting() public votingCreate returns (bool){
        require(queue_last >= queue_first); // check if meat queue is empty 
        if(state == voteState.create){
            current_meat = queue[queue_first];
            state = voteState.open;
            return true;
        } else{
            return false;
        }
    }

    /// @return validVote Is the vote valid? or trigger final result if 10 regulator has voted or block limit exceed
    function doVote(uint grade, uint256 validation_key, uint256 meat) public votingOpen returns (bool validVote){
        require(grade <= 9);
        require(queue[queue_first] == meat); // check is meat id matches currently voted one
        validVote = false;                              //Is the vote valid?
        if(block.number > startingBlock + blocklimit){
            finalResult();
            //state = voteState.end;   
            return validVote; 
        } 
        if (validation_key == 1)  { //regulator has the key? (used 1 as the key for simplicity)
            if(votes[msg.sender].grade == 0){ // check if the sender has voted before
                numVotes = numVotes+1;
                grade_total = grade_total + grade;
            }else{ // update the vote if the voter has voted before
                grade_total = grade_total + grade - votes[msg.sender].grade;
            }
            votes[msg.sender].grade = grade;
            validVote = true;
        }   

        if (numVotes > required_vote-1) { //Quorum is met
            finalResult(); 
        }
        return validVote; 
    }

    /// @notice Determine winner venue
    /// @dev If top 2 venues have the same no of votes, final result depends on vote order
    function finalResult() private{ 
        result_grade = grade_total / numVotes;
        meatnft_contract.getGradingData(current_meat, result_grade);
        numVotes = 0;
        startingBlock = block.number;
        grade_total = 0;
        dequeue();
        state = voteState.create; //Voting state transfered to create
        if(queue_last >= queue_first){ // change the state to 
            startVoting();
        } 
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

contract SupplyChain{
    function getGradingData(uint256 tokenId, uint grade)public {}
}
