const Web3 = require('web3').default;
const hh = require('hardhat');

let comprehensiveContract;
let web3;
let contractInstance;

async function configure() {
  try {
    web3 = new Web3('http://127.0.0.1:8545');
    const contract = await hh.artifacts.readArtifact('ComprehensiveSmartContract');

    comprehensiveContract = new web3.eth.Contract(contract.abi);
    contractInstance = await comprehensiveContract
      .deploy({ data: contract.bytecode })
      .send({ from: (await web3.eth.getAccounts())[0], value: web3.utils.toWei('10', 'ether') });

    console.log('Contract deployed successfully at:', contractInstance.options.address);
  } catch (error) {
    console.error('Error configuring the contract:', error.message);
    process.exit(1);
  }
}

async function registerUser(name, account) {
  try {
    const accounts = await web3.eth.getAccounts();
    const sender = accounts[account];

    await contractInstance.methods.registerUser(name).send({ from: sender });
    console.log('User registered successfully:', name);
  } catch (error) {
    handleContractError(error, 'Error registering user');
  }
}

async function storeData(key, value, account) {
  try {
    const accounts = await web3.eth.getAccounts();
    const sender = accounts[account];

    await contractInstance.methods.storeData(key, value).send({ from: sender });
    console.log('Data stored successfully:', { key, value });
  } catch (error) {
    handleContractError(error, 'Error storing data');
  }
}

async function retrieveData(key, account) {
  try {
    const accounts = await web3.eth.getAccounts();
    const sender = accounts[account];

    const value = await contractInstance.methods.retrieveData(key).call({ from: sender });
    console.log('Data retrieved successfully:', { key, value });
  } catch (error) {
    handleContractError(error, 'Error retrieving data');
  }
}

async function distributeFunds() {
  try {
    const accounts = await web3.eth.getAccounts();
    const owner = accounts[0];

    await contractInstance.methods.distributeFunds().send({
      from: owner,
      value: web3.utils.toWei('5', 'ether'),
    });
    console.log('Funds distributed successfully');
  } catch (error) {
    handleContractError(error, 'Error distributing funds');
  }
}

async function conditionalTransfer(recipient, amount) {
  try {
    const accounts = await web3.eth.getAccounts();
    const owner = accounts[0];

    await contractInstance.methods
      .conditionalTransfer(recipient, web3.utils.toWei(amount.toString(), 'ether'))
      .send({ from: owner });
    console.log('Conditional transfer executed successfully:', { recipient, amount });
  } catch (error) {
    handleContractError(error, 'Error executing conditional transfer');
  }
}

async function createProposal(description) {
  try {
    const accounts = await web3.eth.getAccounts();
    const owner = accounts[0];

    await contractInstance.methods.createProposal(description).send({ from: owner });
    console.log('Proposal created successfully:', description);
  } catch (error) {
    handleContractError(error, 'Error creating proposal');
  }
}

async function vote(proposalId, account) {
  try {
    const accounts = await web3.eth.getAccounts();
    const voter = accounts[account];

    await contractInstance.methods.vote(proposalId).send({ from: voter });
    console.log('Vote cast successfully for proposal ID:', proposalId);
  } catch (error) {
    handleContractError(error, 'Error casting vote');
  }
}

async function getProposal(proposalId) {
  try {
    const proposal = await contractInstance.methods.getProposal(proposalId).call();
    console.log('Proposal retrieved successfully:', proposal);
  } catch (error) {
    handleContractError(error, 'Error retrieving proposal');
  }
}

function handleContractError(error, customMessage) {
  if (error.cause && error.cause.errorArgs && error.cause.errorArgs.message) {
    console.error(`${customMessage}:`, error.cause.errorArgs.message);
  } else if (error.message) {
    console.error(`${customMessage}:`, error.message);
  } else {
    console.error(`${customMessage}: An unknown error occurred.`);
  }
}

async function main() {
  await configure();
  await registerUser('Alice', 1);
  await registerUser('Bob', 2);

  await storeData('key1', 'value1', 1);
  await retrieveData('key1', 1);

  await createProposal('Proposal 1');
  await vote(0, 1);
  await getProposal(0);

  await distributeFunds();
  await conditionalTransfer((await web3.eth.getAccounts())[1], 1);
}

main();
