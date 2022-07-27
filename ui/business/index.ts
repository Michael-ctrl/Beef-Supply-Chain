import chalk from 'chalk'
import Web3 from 'web3'
import { Account } from 'web3-core'
import { Contract } from 'web3-eth-contract'; // contract type

import { addWallet, getBalance, getTokens, initialiseContract, initialiseProvider } from './business'
import { getTokenHistory, getTokenOwners, getTokenInfo } from '../consumer/consumer'
import { methodSend, sendEther } from '../lib/transact'
import inquirer from 'inquirer';
// firebase import
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, addDoc, updateDoc, getDoc} from "firebase/firestore";
var vorpal = require('vorpal')();

let web3: Web3 = new Web3(initialiseProvider());
let account: Account;
let contract: Contract;
let voting: Contract;
let tokens: any = [];

interface Out { 
    description: string;
    location: string;
    quantity: number;
    weight: number;
}
// Initialization for firebase
const firebaseConfig = {
    apiKey: "AIzaSyDE4B921jYQ2nsOeRk5qZwkKzkowc-u8vI",
    authDomain: "meatnft-1385e.firebaseapp.com",
    projectId: "meatnft-1385e",
    storageBucket: "meatnft-1385e.appspot.com",
    messagingSenderId: "242420508999",
    appId: "1:242420508999:web:0d4c4af6c0306d4b50c462"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Easy Setup from CLI
vorpal
    .command('setup', 'Easy setup')
    .hidden()
    .option('-k, --key <privateKey>', 'Private key of your wallet')
    .option('-c, --contract <contractAddress>', 'Address of the NFT contract')
    .option('-v, --voting <contractAddress>', 'Address of the voting contract')
    .types({
        string: ['k', 'key', 'c', 'contract']
    })
    .action(function (this:any, args: any, callback: any) {
        if (args.options.key) {
            setupwallet(this, args.options.key);
        }
        if (args.options.contract) {
            setupcontract(this, args.options.contract);
        }
        if (args.options.voting) {
            setupvoting(this, args.options.voting);
        }
        callback();
    });


// Get contract ABI
vorpal
    .command('setupcontract <contractAddress>', 'Connect to the contract')
    .types({string: ['_']})
    .action(function (this:any, args: any, callback: any) {
        setupcontract(this, args.contractAddress);
        callback();
    });

// Wallet Setup
vorpal
    .command('setupwallet <privateKey>', 'Setup the business wallet')
    .types({string: ['_']})
    .action(function (this: any, args: any, callback: any) {
        setupwallet(this, args.privateKey);
        callback();
    });

// Voting setup
vorpal
    .command('setupvoting <contractAddress>', 'Connect to the voting contract')
    .types({string: ['_']})
    .action(function (this: any, args: any, callback: any) {
        setupvoting(this, args.contractAddress);
        callback();
    });

// List Tokens in Wallet
vorpal
    .command('check', 'List tokens in your wallet')
    .alias('balance')
    .action(async function (this: any, args: any, callback: any) {
        const self = this;
        if (checkAccount()) {
            // Get balance in ether
            self.log(chalk.greenBright('Balance: ') + web3.utils.fromWei(await getBalance(web3, account), 'ether') + ' ETH');

            if (checkContract()) {
                // Get list of tokens
                tokens = await getTokens(web3, contract, account);
                if (tokens.length > 1) {
                    self.log('Tokens:\n' + tokens.join('\n'));
                } else {
                    self.log(chalk.redBright('Error: ') + 'No tokens found in your wallet');
                }
            }
            callback();
        }
    });


// Mint a new token
vorpal
    .command('mint', 'Mint a token')
    .option('-d, --description <description>', 'Description of the item')
    .option('-l, --location <location>', 'Location of the item')
    .option('-w, --weight <weight>', 'Weight of the item')
    .action(async function (this: any, args: any, callback: any) {
        const self = this;
        if (checkAccount()) {
            if (checkContract()) {
                // Setup defaults
                if (!args.options.description) {
                    args.options.description = 'Default Meat Description';
                }
                if (!args.options.location) {
                    args.options.location = 'Default Meat Location';
                }
                if (!args.options.weight) {
                    args.options.weight = 0;
                }

                //console.log(args.options);

                let receipt = await methodSend(web3, account, contract.options.jsonInterface, 'createMeat', contract.options.address, [args.options.description, args.options.location, args.options.weight]);
                self.log(chalk.greenBright('Token minted ') + receipt.transactionHash);
            }
        }
        callback();
    });

//get firebase data
vorpal
.command('getData', 'Get image URL data')
.option('-i, --tokenURI <tokenURI>', 'tokenURI')
.types({string: ['i', 'tokenURI']})
.action(function (this:any, args: any, callback: any) {
    getData(this, args);
    callback();
});

// Request voting
vorpal
    .command('vote <tokenID> [quorum]', 'Request voting')
    .types({string: ['_']})
    .action(async function (this: any, args: any, callback: any) {
        const self = this;
        if (checkAccount()) {
            if (checkContract()) {
                if (checkVoting()) {
                    // Check if token exists and is owned by user
                    // Update tokens list
                    tokens = await getTokens(web3, contract, account);
                    if (tokens.find(args.tokenID)) {
                        if (!args.quorum) {
                            args.quorum = 5;
                        }
                        // Request voting
                        let receipt = await methodSend(web3, account, voting.options.jsonInterface, 'requestVoting', voting.options.address, [args.tokenID, args.quorum]);
                        self.log(chalk.greenBright('Request sent ') + receipt.transactionHash);
                    }
                }
            }
        }
        callback();
    });

// Send NFT
vorpal
    .command('send <tokenID> <to>', 'Send NFT')
    .types({string: ['_']})
    .action(async function (this: any, args: any, callback: any) {
        const self = this;
        if (!account) {
            self.log(chalk.redBright('Error: ') + 'Please setup your wallet with ' + chalk.gray('setupwallet'));
        } else {
            if (!contract) {
                self.log(chalk.redBright('Error: ') + 'Please connect to a contract with ' + chalk.gray('contract <contractAddress>'));
            } else {
                let receipt = await methodSend(web3, account, contract.options.jsonInterface, 'transferFrom', contract.options.address, [account.address, args.to, args.tokenID as BigInt]);
                self.log(chalk.greenBright('Token sent ') + receipt.transactionHash);
            }
        }
        callback();
    });

// Split/merge
vorpal
    .command('splitmerge', 'Split/merge a set of tokens')
    .alias('sm')
    .action(async function (this: any, args: any, callback: any) {
        const self = this;
        if (checkAccount()) {
            if (checkContract()) {
                tokens = await getTokens(web3, contract, account); // update token list
                let inputList: number[] = [];
                await inquirer.prompt([{
                    type: 'checkbox',
                    name: 'tokens',
                    message: 'Select tokens to split/merge',
                    choices: tokens,
                }]).then(function (answers: any) {
                    inputList = answers.tokens;
                });

                let amount: number = 0;
                await inquirer.prompt([{
                    type: 'input',
                    name: 'amount',
                    message: 'Enter the number of unique token types to be created: ',
                }]).then(function (answers: any) {
                    amount = answers.amount;
                });
                let outputList: Out[] = [];
                let i = 0;
                await getDetails(i, amount, outputList);
                //this.log(outputList);
                let receipt = await methodSend(web3, account, contract.options.jsonInterface, 'splitMerge', contract.options.address, [inputList, outputList]);
                this.log(chalk.greenBright('Tokens split/merged ') + receipt.transactionHash);
            }
        }
        callback();
    });
                
// Transact Ether
vorpal
    .command('sendeth <amount> <address>', 'Send ether to an address')
    .types({string: ['_']})
    .action(async function (this: any, args: any, callback: any) {
        const self = this;

        if (checkAccount()) {
            //send eth
            let receipt = await sendEther(web3, account.address, args.address, web3.utils.toWei(args.amount as string, 'ether'));
            self.log(chalk.greenBright('Transaction sent ') + receipt.transactionHash);
            callback();
        }
    });

vorpal
    .command('viewMeatHistory <tokenId>', 'View History and grading data of original cows')
    .action(async function (this: any, args: any, callback: any) {
        const self = this;
        if (!account) {
            self.log(chalk.redBright('Error: ') + 'Please setup your wallet with ' + chalk.gray('setupwallet'));
            callback();
        } else {
            // Get balance in ether
            self.log(chalk.greenBright('Balance: ') + web3.utils.fromWei(await getBalance(web3, account), 'ether') + ' ETH');

            if (!contract) {
                self.log(chalk.redBright('Error: ') + 'Please connect to a contract with ' + chalk.gray('contract <contractAddress>'));
            } else {
                let meatHistory: any = {};
                meatHistory = await getTokenHistory(contract, args.tokenId);
                self.log(meatHistory);
            }
            callback();
        }
    });

vorpal
    .command('viewMeatInfo <tokenId>', 'View on-chain info of any token')
    .action(async function (this: any, args: any, callback: any) {
        const self = this;
        if (!account) {
            self.log(chalk.redBright('Error: ') + 'Please setup your wallet with ' + chalk.gray('setupwallet'));
            callback();
        } else {
            // Get balance in ether
            self.log(chalk.greenBright('Balance: ') + web3.utils.fromWei(await getBalance(web3, account), 'ether') + ' ETH');

            if (!contract) {
                self.log(chalk.redBright('Error: ') + 'Please connect to a contract with ' + chalk.gray('contract <contractAddress>'));
            } else {
                let meatInfo: any = [];
                meatInfo = await getTokenInfo(contract, args.tokenId);
                let meatOwners: any = [];
                meatOwners = await getTokenOwners(contract, args.tokenId);
                self.log(meatInfo);
                self.log(chalk.gray('List of owners of this piece of meat'));
                self.log(meatOwners);
            }
            callback();
        }
    });

// Used instead of vorpal.parse, just removes the process.exit so the CLI can be used
// Doesn't support the minimist option to reduce unnecessary imports
vorpal.run = function (argv: any, options: any, done: any) {
    // Modification of code found here: https://github.com/dthree/vorpal/blob/master/lib/vorpal.js#L155-L184
    // Get reference to loadsh attached to vorpal.
    var _ = this.lodash;
  
    options = options || {};
    var args = argv;
    var result = this;
    var catchExists = !(_.find(this.commands, {_catch: true}) === undefined);
    args.shift();
    args.shift();
    if (args.length > 0 || catchExists) {
        // Wrap the spaced args back in quotes.
        for (let i = 0; i < args.length; ++i) {
            if (i === 0) {
                continue;
            }
            if (args[i].indexOf(' ') > -1) {
                args[i] = `"${args[i]}"`;
            }
        }
        this.exec(args.join(' '), function (err: any) {
        if (err !== undefined && err !== null) {
            throw new Error(err);
        }
        
        // NOTE: Here is where I got rid of the process exit.
        // and replaced with a promise.
        if (done) { done(); }
  
        // process.exit(0);
        });
    }
    return result;
};

// Helper functions
function setupcontract (instance: any, address: string) {
    contract = initialiseContract(web3, address);
    instance.log(chalk.greenBright('Loaded contract ABI for ') + contract.options.address);
}

function setupwallet (instance: any, key: string) {
    const self = instance;
    account = addWallet(web3, key);
    instance.log(chalk.greenBright('Wallet added ') + account.address);
}

async function getData(instance: any, args: any){
    if(args.options.tokenURI){
        const docRef = doc(db, "meatNFTs", args.options.tokenURI);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            // Convert to City object
            const meat = docSnap.data();
            // Use a City instance method
            instance.log(meat);
          } else {
            instance.log("No such document!");
          }
    }else{
        instance.log("No token id provided");
    }
}

function setupvoting (instance: any, address: string) {
    voting = initialiseContract(web3, address);
    instance.log(chalk.greenBright('Loaded contract ABI for ') + address);
}

function checkAccount (): boolean {
    if (!account) {
        console.log(chalk.redBright('Error: ') + 'Please setup your wallet with ' + chalk.gray('setupwallet <privateKey>'));
        return false;
    } else {
        return true;
    }
}

function checkContract (): boolean {
    if (!contract) {
        console.log(chalk.redBright('Error: ') + 'Please connect to a contract with ' + chalk.gray('setupcontract <contractAddress>'));
        return false;
    } else {
        return true;
    }
}

function checkVoting (): boolean {
    if (!voting) {
        console.log(chalk.redBright('Error: ') + 'Please connect to a voting contract with ' + chalk.gray('setupvoting <contractAddress>'));
        return false;
    } else {
        return true;
    }
}

async function getDetails(i: number, amount: number, outputList: Out[]) {
    await inquirer.prompt(questions).then(async function (answers: any) {
        outputList.push({
            description: answers.description,
            location: answers.location,
            quantity: answers.quantity,
            weight: answers.weight,
        })
        i++;
        if (i < amount) {
            await getDetails(i, amount, outputList);
        }
    });
}

const questions = [
    {
        type: 'input',
        name: 'description',
        message: 'Enter description: ',
    },
    {
        type: 'input',
        name: 'location',
        message: 'Enter location: '
    },
    {
        type: 'input',
        name: 'weight',
        message: 'Enter weight: ',
    },
    {
        type: 'input',
        name: 'quantity',
        message: 'Enter quantity: ',
    },
  ];

vorpal
    .delimiter(chalk.blue('business') + ' > ')
    .run(process.argv)
    .show();