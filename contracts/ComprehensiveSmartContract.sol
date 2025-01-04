// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ComprehensiveSmartContract {
    struct User {
        address userAddress;
        string name;
    }

    struct Proposal {
        string description;
        uint256 voteCount;
    }

    mapping(address => User) private users;
    mapping(string => string) private dataStore;
    address[] private registeredUsers;
    Proposal[] private proposals;

    address public owner;
    mapping(address => bool) public hasVoted;

    event UserRegistered(address indexed userAddress, string name);
    event DataStored(string key, string value);
    event FundsDistributed(uint256 totalAmount);
    event ConditionalTransferExecuted(address recipient, uint256 amount);
    event ProposalCreated(uint256 proposalId, string description);
    event VoteCast(address indexed voter, uint256 proposalId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() payable {
        owner = msg.sender;
    }

    function registerUser(string memory name) public {
        require(users[msg.sender].userAddress == address(0), "User already registered");
        users[msg.sender] = User(msg.sender, name);
        registeredUsers.push(msg.sender);
        emit UserRegistered(msg.sender, name);
    }

    function storeData(string memory key, string memory value) public {
        dataStore[key] = value;
        emit DataStored(key, value);
    }

    function retrieveData(string memory key) public view returns (string memory) {
        return dataStore[key];
    }

    function distributeFunds() public payable onlyOwner {
        require(msg.value > 0, "No Ether provided");
        uint256 amountPerUser = msg.value / registeredUsers.length;
        for (uint256 i = 0; i < registeredUsers.length; i++) {
            payable(registeredUsers[i]).transfer(amountPerUser);
        }
        emit FundsDistributed(msg.value);
    }

    function conditionalTransfer(address recipient, uint256 amount) public onlyOwner {
        require(address(this).balance >= amount, "Insufficient contract balance");
        payable(recipient).transfer(amount);
        emit ConditionalTransferExecuted(recipient, amount);
    }

    function createProposal(string memory description) public onlyOwner {
        proposals.push(Proposal(description, 0));
        emit ProposalCreated(proposals.length - 1, description);
    }

    function vote(uint256 proposalId) public {
        require(users[msg.sender].userAddress != address(0), "User not registered");
        require(proposalId < proposals.length, "Invalid proposal ID");
        require(!hasVoted[msg.sender], "User has already voted");

        proposals[proposalId].voteCount += 1;
        hasVoted[msg.sender] = true;
        emit VoteCast(msg.sender, proposalId);
    }

    function getProposal(uint256 proposalId) public view returns (string memory description, uint256 voteCount) {
        require(proposalId < proposals.length, "Invalid proposal ID");
        Proposal memory proposal = proposals[proposalId];
        return (proposal.description, proposal.voteCount);
    }

    receive() external payable {}
}