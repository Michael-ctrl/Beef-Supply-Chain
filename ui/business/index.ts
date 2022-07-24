import chalk from 'chalk'
import Web3 from 'web3'
import { Account } from 'web3-core'
import { Contract } from 'web3-eth-contract'; // contract type

import { addWallet, getBalance, getTokens, initialiseContract, initialiseProvider } from './business'
import { methodSend } from './transact'

var vorpal = require('vorpal')();

let web3: Web3 = new Web3(initialiseProvider());
let account: Account;
let contract: Contract;
let tokens = [];

// Easy Setup from CLI
vorpal
    .command('setup', 'Easy setup')
    .hidden()
    .option('-k, --key <privateKey>', 'Private key of your wallet')
    .option('-c, --contract <contractAddress>', 'Address of the NFT contract')
    .types({
        string: ['k', 'key', 'c', 'contract']
    })
    .action(function (this:any, args: any, callback: any) {
        setupcontract(this, args);
        setupwallet(this, args);
        callback();
    });


// Get contract ABI
vorpal
    .command('setupcontract <contractAddress>', 'Connect to the contract')
    .types({string: ['_']})
    .action(function (this:any, args: any, callback: any) {
        setupcontract(this, args);
        callback();
    });

// Wallet Setup
vorpal
    .command('setupwallet <privateKey>', 'Setup the business wallet')
    .types({string: ['_']})
    .action(function (this: any, args: any, callback: any) {
        setupwallet(this, args);
        callback();
    });

// List Tokens in Wallet
vorpal
    .command('check', 'List tokens in your wallet')
    .alias('balance')
    .action(async function (this: any, args: any, callback: any) {
        const self = this;
        if (!account) {
            self.log(chalk.redBright('Error: ') + 'Please setup your wallet with ' + chalk.gray('setupwallet'));
            callback();
        } else {
            // Get balance in ether
            self.log('Balance: ' + web3.utils.fromWei(await getBalance(web3, account), 'ether') + ' ETH');

            if (!contract) {
                self.log(chalk.redBright('Error: ') + 'Please connect to a contract with ' + chalk.gray('contract <contractAddress>'));
            } else {
                // Get list of tokens
                tokens = await getTokens(web3, contract, account);
                if (tokens.length > 0) {
                    self.log('Tokens: ' + tokens.join('\n'));
                } else {
                    self.log(chalk.redBright('Error: ') + 'No tokens found in your wallet');
                }
            }
            callback();
        }
    });

// Transact Ether
vorpal
    .command('send <amount> <address>', 'Send ether to an address')
    .types({string: ['_']})
    .action(async function (this: any, args: any, callback: any) {
        const self = this;

        if (!account) {
            self.log(chalk.redBright('Error: ') + 'Please setup your wallet with ' + chalk.gray('setupwallet'));
            callback();
        } else {
            //send eth
            self.log(chalk.greenBright('Transaction sent '));
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
function setupcontract (instance: any, args: any) {
    //console.log(instance, args);
    contract = initialiseContract(web3, args.options.contract);
    instance.log(chalk.greenBright('Connected to contract ') + args.options.contract);
}

function setupwallet (instance: any, args: any) {
    const self = instance;
    if (!args.options.key) {
        return instance.prompt({
            type: 'input',
            name: 'privateKey',
            message: 'Enter your private key: ',
        }, function(result: any) {
            account = addWallet(web3, result.privateKey);
        })
    } else {
        account = addWallet(web3, args.options.key);
    }
    instance.log(chalk.greenBright('Wallet added ') + account.address);
}

vorpal
    .delimiter('business > ')
    .run(process.argv)
    .show();