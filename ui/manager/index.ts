import Web3 from 'web3';
import { deployContract, initialiseProvider } from './manager';
import { Account } from 'web3-core';


let vorpal = require('vorpal')();
let fs = require('fs');
let solc = require('solc');

let web3: Web3 = new Web3(initialiseProvider());
let account: Account;


vorpal
    .command('deployvoting', 'Deploy the voting contract')
    .action(async function (this:any, args: any, callback: any) {
        try {
            let account = getAccount(web3, "user");
            let loaded = loadCompiledSols(["Voting"]);
            //console.log(loaded)
            let contract = await deployContract(web3!, account, loaded.contracts["Voting"]["Voting"].abi, loaded.contracts["Voting"]["Voting"].evm.bytecode.object);
            console.log("user app contract address: " + contract.options.address);
        } catch (error) {
            console.error("error deploying contract");
            console.error(error);
        }
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

function findImports(importPath: string) {
    try {
        if (importPath.startsWith('@')) {
            return {contents: fs.readFileSync(`node_modules/${importPath}`, 'utf8')};
        } else {
            return {contents: fs.readFileSync(`smartcontracts/${importPath}`, 'utf8')};
        }
    } catch (e: any) {
        return {
            error: e.message
        };
    }
}

function loadCompiledSols(solNames: string[]): any {
    interface SolCollection { [key: string]: any };

    let sources: SolCollection = {};
    solNames.forEach((value: string, index: number, array: string[]) => {
        let a_file = fs.readFileSync(`smartcontracts/${value}.sol`, 'utf8');
        sources[value] = {
            content: a_file
        };
    });
    let input = {
        language: 'Solidity',
        sources: sources,
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };

    let compiler_output = solc.compile(JSON.stringify(input), { import: findImports });

    let output = JSON.parse(compiler_output);

    return output;
}