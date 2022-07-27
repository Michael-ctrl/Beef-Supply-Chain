import chalk from 'chalk'
import Web3 from 'web3'
import { Account } from 'web3-core'
import { Contract } from 'web3-eth-contract'; // contract type

import { addWallet, getBalance, initialiseContract, initialiseProvider, getTokenInfo } from './consumer'
import { methodSend } from '../lib/transact'

var vorpal = require('vorpal')();

let web3: Web3 = new Web3(initialiseProvider());
let account: Account;
let contract: Contract;


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
        setupcontract(this, args.options.contract);
        setupwallet(this, args.options.key);
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
    .command('setupwallet <privateKey>', 'Setup the b wallet')
    .types({string: ['_']})
    .action(function (this: any, args: any, callback: any) {
        setupwallet(this, args.privateKey);
        callback();
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
                let receipt = await methodSend(web3, account, contract.options.jsonInterface, 'getHistory', contract.options.address, [args.tokenId, 100]);  
                console.log(receipt.logs);
            }
            callback();
        }
    });

vorpal
    .command('viewTokenInfo <tokenId>', 'View on-chain info of any token')
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
                meatInfo = await getTokenInfo(web3, contract, account, args.tokenId);
                self.log(meatInfo)
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
    instance.log(chalk.greenBright('Loaded contract ABI for ') + address);
}

function setupwallet (instance: any, key: string) {
    const self = instance;
    account = addWallet(web3, key);
    instance.log(chalk.greenBright('Wallet added ') + account.address);
}

vorpal
    .delimiter(chalk.blue('consumer') + ' > ')
    .run(process.argv)
    .show();