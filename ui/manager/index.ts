import Web3 from 'web3';
import { addWallet, deployContract, initialiseContract } from './manager';
import { WebsocketProvider, Account } from 'web3-core'; 
import { loadCompiledSols } from '../../offchain/oracle/load';
import { Contract } from 'web3-eth-contract';
import chalk from 'chalk';
import { methodSend } from '../lib/transact'


let vorpal = require('vorpal')();
let fs = require('fs');
let solc = require('solc');

let account: Account;
let contract: Contract;
let voteContract: Contract;
let web3: Web3 = new Web3(initializeProvider());


vorpal
    .command('deploymeat', 'Deploy the meatNFT contract')
    .action(async function (this:any, args: any, callback: any) {
        try {
            let web3: Web3 = new Web3(initializeProvider());
            let account = getAccount(web3, "user");
            let loaded = loadCompiledSols(["MeatNFT"]);
            //console.log(loaded)
            contract = await deployContract(web3!, account, loaded.contracts["MeatNFT"]["MeatNFT"].abi, loaded.contracts["MeatNFT"]["MeatNFT"].evm.bytecode.object);
            console.log(chalk.greenBright("Contract deployed at: ") + contract.options.address);
            setupcontract(this, contract.options.address);
            setupwallet(this, account.privateKey);
        } catch (error) {
            console.error("Error deploying contract: ");
            console.error(error);
        }
        callback();
    });
    
vorpal
.command('deployvoting', 'Deploy the voting contract')
.action(async function (this:any, args: any, callback: any) {
    try {
        let account = getAccount(web3, "user");
        let loaded = loadCompiledSols(["Voting"]);
        //console.log(loaded)
        voteContract = await deployContract(web3!, account, loaded.contracts["Voting"]["Voting"].abi, loaded.contracts["Voting"]["Voting"].evm.bytecode.object);
        console.log(chalk.greenBright("Contract deployed at: ") + voteContract.options.address);
    } catch (error) {
        console.error("error deploying contract");
        console.error(error);
    }
    callback();
});

vorpal
    .command('makeminter <userAddress>', 'Make address a minter')
    .types({string: [' ']})
    .action(async function (this: any, args: any, callback: any) {
        const self = this;
        let receipt = await methodSend(web3, account, contract.options.jsonInterface, 'makeMinter', contract.options.address, [args.userAddress]);
        self.log(chalk.greenBright('User is made a minter ') + receipt.transactionHash);
        callback();
    });

vorpal
    .command('makeburner <userAddress>', 'Make address a burner')
    .types({string: [' ']})
    .action(async function (this: any, args: any, callback: any) {
        const self = this;
        let receipt = await methodSend(web3, account, contract.options.jsonInterface, 'makeBurner', contract.options.address, [args.userAddress]);
        self.log(chalk.greenBright('User is made a burner ') + receipt.transactionHash);
        callback();
    });

vorpal
    .command('makevoter <userAddress>', 'Make address a voter')
    .types({string: [' ']})
    .action(async function (this: any, args: any, callback: any) {
        const self = this;
        let receipt = await methodSend(web3, account, contract.options.jsonInterface, 'makeVoter', contract.options.address, [args.userAddress]);
        self.log(chalk.greenBright('User is made a voter ') + receipt.transactionHash);
        callback();
    });
    
vorpal
    .command('makeprocessor <userAddress>', 'Make address a processor')
    .types({string: [' ']})
    .action(async function (this: any, args: any, callback: any) {
        const self = this;
        let receipt = await methodSend(web3, account, contract.options.jsonInterface, 'makeProcessor', contract.options.address, [args.userAddress]);
        self.log(chalk.greenBright('User is made a processor ') + receipt.transactionHash);
        callback();
    });
    
    
// helper functions

// Read the requested account from the accounts.json file and return an AddedAccount
function getAccount(web3: Web3, name: string): Account {
    try {
        let account_data = fs.readFileSync('json/accounts.json');
        let account_json = JSON.parse(account_data);
        let account_pri_key = account_json[name]["pri_key"];
        return web3.eth.accounts.wallet.add('0x' + account_pri_key);
    } catch (error) {
        throw "Cannot read account";
    }
}

// Read the blockchain provider from the providers.json file and return a Web3 provider
function initializeProvider(): WebsocketProvider {
    try {
        let provider_data = fs.readFileSync('json/providers.json');
        let provider_json = JSON.parse(provider_data);
        let provider_link = provider_json["provider_link"];
        return new Web3.providers.WebsocketProvider(provider_link);
    } catch (error) {
        throw "Cannot read provider";
    }
}

function setupcontract (instance: any, address: string) {
    //console.log(instance, args);
    contract = initialiseContract(web3, address);
    instance.log(chalk.greenBright('Loaded contract ABI for ') + address);
}

function setupwallet (instance: any, key: string) {
    const self = instance;
    account = addWallet(web3, key);
    instance.log(chalk.greenBright('Wallet added ') + account.address);
}

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

vorpal
    .delimiter(chalk.yellow('manager') + ' > ')
    .run(process.argv)
    .show();