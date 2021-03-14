// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.21 <0.8.0;
pragma experimental ABIEncoderV2;

import "./GorenCoinToken.sol";

contract Election {
    // Structs
    struct Candidate {
        string fullName;
        uint256 voteCount;
    }

    struct Voter {
        bool authorized;
        bool voted;
        uint256 vote;
    }

    // Fields
    address payable public owner;
    bool public voteLive;

    GorenCoinToken public tokenContract;
    uint256 public tokenPrice;

    mapping(address => Voter) public voters;
    Candidate[] public candidates;
    uint256 public totalVotes;
    uint256 public countCandidates;

    event AddedCandidate(uint256 candidateID);
    // Voted event
    event votedEvent(uint256 indexed _candidateId);

    // Modifiers

    modifier ownerOnly() {
        require(owner == msg.sender, "Not Owner");
        _;
    }

    modifier authToVote() {
        require(voteLive);
        require(!voters[msg.sender].voted);
        require(voters[msg.sender].authorized);
        _;
    }

    // Constructor
    constructor(GorenCoinToken _tokenContract, uint256 _tokenPrice) public {
        owner = msg.sender;

        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;

        addCandidate("test");
    }

    // Start Vote - Only by owner command
    function startVote() public ownerOnly {
        voteLive = true;
    }

    // End Vote - Triggered by time
    function endVote() public ownerOnly returns (string memory) {
        voteLive = false;
        uint256 _winner = 999;
        uint256 _maxVotes = 0;

        for (uint256 i = 0; i < countCandidates; i++) {
            if (candidates[i].voteCount >= _maxVotes) {
                _maxVotes = candidates[i].voteCount;
                _winner = i;
            }
        }

        return candidates[_winner].fullName;
    }

    // Add new candidate
    function addCandidate(string memory _fullName) public ownerOnly {
        candidates.push(Candidate(_fullName, 0));
        countCandidates += 1;
        emit AddedCandidate(getNumOfCandidates());
    }

    // Get total num of candidates
    function getNumOfCandidates() public view returns (uint256) {
        return countCandidates;
    }

    // Autorize someone to vote - only by owner
    function authorize(address _person) public ownerOnly {
        voters[_person].authorized = true;
    }

    // Vote function with asserts
    function vote(uint256 _voteIndex) public authToVote {
        voters[msg.sender].vote = _voteIndex;
        voters[msg.sender].voted = true;

        candidates[_voteIndex].voteCount += 1;
        totalVotes += 1;

        tokenContract.transfer(msg.sender, 1);

        emit votedEvent(_voteIndex);
    }

    // End Contract
    function end() public ownerOnly {
        selfdestruct(owner);
    }
}
