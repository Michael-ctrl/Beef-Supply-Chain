import chalk from 'chalk'
import Web3 from 'web3'
import { Account } from 'web3-core'
import { Contract } from 'web3-eth-contract'; // contract type

import { addWallet, getBalance, getTokens, initialiseContract, initialiseProvider } from './business'
import { methodSend, sendEther } from '../lib/transact'

var vorpal = require('vorpal')();

let web3: Web3 = new Web3(initialiseProvider());
let account: Account;
let contract: Contract;
let voting: Contract;
let tokens: any = [];

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

// Request voting
vorpal
    .command('request <tokenID>', 'Request voting')
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
                        // Request voting
                        let receipt = await methodSend(web3, account, voting.options.jsonInterface, 'requestVoting', voting.options.address, [args.tokenID]);
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
    .action(async function (this: any, args: any, callback: any) {
        const self = this;
        if (checkAccount()) {
            if (checkContract()) {
                tokens = await getTokens(web3, contract, account); // update token list
                let inputList: number[] = [];
                interface Out { description: string, location: string, quantity: number, weight: number };
                let outputList: Out[]
                return self.prompt({
                    type: 'checkbox',
                    name: 'tokens',
                    message: 'Select tokens to split/merge',
                    choices: tokens
                }, function(answer: any) {
                    inputList = answer.tokens;
                    return self.prompt({
                        type: 'input',
                        name: 'amount',
                        message: 'Enter the number of unique token types to be created: '
                    }, function(answer: any) {
                        for (let i = 0; i < answer.amount; i++) {
                            return self.prompt({
                                type: 'input',
                                name: 'description',
                                message: 'Enter description for type ' + i + ' '
                            }, function(answer: any) {
                                let tokenDesc: string = answer.description;
                                return self.prompt({
                                    type: 'input',
                                    name: 'location',
                                    message: 'Enter location for type ' + i + ' '
                                }, function(answer: any) {
                                    let tokenLoc: string = answer.location;
                                    return self.prompt({
                                        type: 'input',
                                        name: 'weight',
                                        message: 'Enter weight for type ' + i + ' '
                                    }, function(answer: any) {
                                        let tokenWeight: number = answer.weight;
                                        return self.prompt({
                                            type: 'input',
                                            name: 'quantity',
                                            message: 'Enter the number of tokens you would like output: '
                                        }, function(answer: any) {
                                            let tokenQuantity: number = answer.quantity;
                                            outputList.push({description: tokenDesc, location: tokenLoc, quantity: tokenQuantity, weight: tokenWeight});
                                        });
                                    });
                                });
                            });
                        }
                    });
                });
            }
        }
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

vorpal
    .delimiter(chalk.blue('business') + ' > ')
    .run(process.argv)
    .show();