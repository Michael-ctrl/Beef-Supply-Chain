import chalk from 'chalk'
import Web3 from 'web3'
import { Account } from 'web3-core'
import { Contract } from 'web3-eth-contract'; // contract type

import { addWallet, getBalance, getTokens, initialiseContract, initialiseProvider } from './regulator'
import { methodSend } from '../lib/transact'

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

// Upload data
vorpal
    .command('upload', 'Upload data')
    .option('c, -- <tokenURI>')
    .option('-i, --image <imagePath>', 'Path to image to be uploaded')
    .action(function (this:any, args: any, callback: any) {
        doUpload(this, args);
        callback();
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

function doUpload(instance: any, args: any){
    console.log("proccessing upload");
}

vorpal
    .delimiter('business > ')
    .run(process.argv)
    .show();