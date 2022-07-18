// SPDX-License-Identifier: UNLICENSED


/*
    Added test case:
        9.1 test if the duplication of vote was preveneted during vote phase.
        9.2 test start, voting, end phase repectively 
        9.3 added a function at testblocklimit(), changing the block limit in original contract to test 
            when the blcoklimit exceed (12 in this case), doVote() function will not process vote function but rather terminate the result,
            which will cause the lunch vencue test to fail. On the other hand, change the blocklimit to 100 will cause settle the final vote result.
        9.4 added a test function(commented out), uncomment to test the force disable function

    @note some of the error testing message was not set exactly to the message regarding the error, 
        this is due to when having two modifier, soilidity will return the erro mesage from the first modifier 
        rather than the actual message defined
    
*/

pragma solidity >=0.8.00 <0.9.0;
import "remix_tests.sol"; // this import is automatically injected by Remix. import "remix_accounts.sol";
import "remix_accounts.sol";
import "../Contract/LunchVenue_updated.sol";

// File name has to end with '_test.sol', this file can contain more than one testSuite contracts
/// Inherit 'LunchVenue' contract
contract LunchVenueTest is LunchVenue {
    // Variables used to emulate different accounts
    address acc0; 
    address acc1;
    address acc2; 
    address acc3;
    address acc4;
    
    /// 'beforeAll' runs before all other tests
    /// More special functions are: 'beforeEach', 'beforeAll', 'afterEach' & 'afterAll'
    function beforeAll() public {
        acc0 = TestsAccounts.getAccount(0); // Initiate account variables
        acc1 = TestsAccounts.getAccount(1); 
        acc2 = TestsAccounts.getAccount(2);
        acc3 = TestsAccounts.getAccount(3); 
        acc4 = TestsAccounts.getAccount(4);
    }

    /// Account at zero index (account-0) is default account, so manager will be set to acc0
    function managerTest() public {
        Assert.equal(manager, acc0, 'Manager should be acc0');
    }

    /// Add lunch venue as manager
    /// When msg.sender isn't specified , default account (i.e., account -0) is considered as the sender
    function setLunchVenue() public {
        Assert.equal(addVenue('Courtyard Cafe'), 1, 'Should be equal to 1'); 
        Assert.equal(addVenue('Uni Cafe'), 2, 'Should be equal to 2');
    }

    /// Try to add lunch venue as a user other than manager. This should fail 
    /// #sender: account-1
    function setLunchVenueFailure() public {
        try this.addVenue('Atomic Cafe') returns (uint v) {
            Assert.ok(false, 'Method execution should fail'); 
        } catch Error(string memory reason) {
            // Compare failure reason, check if it is as expected
            Assert.equal(reason, 'Can only be executed by the manager', 'Failed withunexpected reason');
        } catch (bytes memory /*lowLevelData*/) {
            Assert.ok(false, 'Failed unexpected'); 
        }
    }

    /// Set friends as account-0
    /// #sender doesn't need to be specified explicitly for account-0
    function setFriend() public {
        Assert.equal(addFriend(acc0, 'Alice'), 1, 'Should be equal to 1');
        Assert.equal(addFriend(acc1, 'Bob'), 2, 'Should be equal to 2'); 
        Assert.equal(addFriend(acc2, 'Charlie'), 3, 'Should be equal to 3');
        Assert.equal(addFriend(acc3, 'Eve'), 4, 'Should be equal to 4');
    }

    /// Try adding friend as a user other than manager. This should fail 
    /// #sender: account-2
    function setFriendFailure() public {
        try this.addFriend(acc4, 'Daniels') returns (uint f) { 
            Assert.ok(false, 'Method execution should fail');
        } catch Error(string memory reason) {
            // Compare failure reason, check if it is as expected
            Assert.equal(reason, 'Can only be executed by the manager', 'Failed with unexpected reason');
        } catch (bytes memory /*lowLevelData*/) { 
            Assert.ok(false, 'Failed unexpected');
        } 
    }

    /// test start voting function
    /// #sender: account-1
    function StartVoteFailed() public {    
        try this.startVoting() returns (bool f) { 
            Assert.ok(false, 'Method execution should fail');
        } catch Error(string memory reason) {
            // Compare failure reason, check if it is as expected
            Assert.equal(reason, 'Can only be executed by the manager', 'Failed with unexpected reason');
        } catch (bytes memory /*lowLevelData*/) { 
            Assert.ok(false, 'Failed unexpected');
        } 
    }


    /// test start voting function
    /// #sender: account-0
    function StartVote() public {
        Assert.ok(startVoting(), 'manager Should be able to start vote');
    }

    /// Try adding friend during voting phase, not allowable.
    /// #sender: account-0
    function setFriendOpening() public {
        try this.addFriend(acc4, 'Daniels') returns (uint f) { 
            Assert.ok(false, 'Method execution should fail');
        } catch Error(string memory reason) {
            // Compare failure reason, check if it is as expected
            Assert.equal(reason, 'Can only be executed by the manager', 'Failed with unexpected reason');
        } catch (bytes memory /*lowLevelData*/) { 
            Assert.ok(false, 'Failed unexpected');
        } 
    }

    /// Function to test self destruct functions, uncomment to test it, while unccoment, other test case might fail
    /// sender: account-0
    // function disableContract() public {

    //     forceDisable();

    //     // test add friend
    //     try this.addFriend(acc4, 'Daniels') returns (uint f) { 
    //         Assert.ok(false, 'Method execution should fail');
    //     } catch Error(string memory reason) {
    //         // Compare failure reason, check if it is as expected
    //         Assert.equal(reason, 'Can only be executed by the manager', 'Failed with unexpected reason');
    //     } catch (bytes memory /*lowLevelData*/) { 
    //         Assert.ok(false, 'Failed unexpected');
    //     } 

    //     // test add venue
    //     try this.addVenue('Atomic Cafe') returns (uint v) {
    //         Assert.ok(false, 'Method execution should fail'); 
    //     } catch Error(string memory reason) {
    //         // Compare failure reason, check if it is as expected
    //         Assert.equal(reason, 'Can only be executed by the manager', 'Failed withunexpected reason');
    //     } catch (bytes memory /*lowLevelData*/) {
    //         Assert.ok(false, 'Failed unexpected'); 
    //     }

    //     // test vote
    //     try this.doVote(1) returns (bool validVote){
    //         Assert.ok(false, 'Method Execution Should Fail'); 
    //     } catch Error(string memory reason) {
    //         // Compare failure reason, check if it is as expected
    //         Assert.equal(reason, 'Can vote only while voting is open.', 'Failed with unexpected reason');
    //     } catch (bytes memory /*lowLevelData*/) {
    //         Assert.ok(false, 'Failed unexpectedly'); 
    //     }

    // }

    /// Vote as Bob (acc1)
    /// #sender: account-1
    function vote() public {
        Assert.ok(doVote(2), "Voting result should be true");
    }

    /// Vote duplication check
    /// #sender: account-1
    function voteDuplicationCheck() public {
        Assert.equal(doVote(1), false, "Voting should return false");
    }

    /// Try voting as a user not in the friends list. This should fail 
    /// #sender: account-4
    function voteFailure() public {
        Assert.equal(doVote(1), false, "Voting result should be false");
    }
    
    /// Vote as Charlie 
    /// #sender: account-2
    function vote2() public {
        Assert.ok(doVote(2), "Voting result should be true");
    }

    /// Vote as Eve
    /// change the blocklimit to 12 or greater than 12 in the origianl file, below section should work accordingly
    /// which shows that the blocklimit function works, note when changed to 12 lunch venure test should fail since no result will be concluded
    /// #sender: account-3
    function testblocklimit() public {
        if(blocklimit == 12){
            Assert.equal(doVote(2), false, "Voting result should be false");
        }else if (blocklimit > 12){
            Assert.ok(doVote(2), "Voting result should be true");
        }
    }
    
    /// Verify lunch venue is set correctly
    function lunchVenueTest() public {
        Assert.equal(votedVenue, 'Uni Cafe', 'Selected venue should be Uni Cafe'); 
    }
     
    /// Verify voting after vote closed. This should fail 
    /// #sender: account -2
    function voteAfterClosedFailure() public {
        try this.doVote(1) returns (bool validVote){
            Assert.ok(false, 'Method Execution Should Fail'); 
        } catch Error(string memory reason) {
            // Compare failure reason, check if it is as expected
            Assert.equal(reason, 'Can vote only while voting is open.', 'Failed with unexpected reason');
        } catch (bytes memory /*lowLevelData*/) {
            Assert.ok(false, 'Failed unexpectedly'); 
        }
    } 
}
