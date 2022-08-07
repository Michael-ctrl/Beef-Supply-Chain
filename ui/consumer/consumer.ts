// This program is a library which will be used by the CLI
// It can be tested programmatically

import Web3 from 'web3';
import { Contract } from 'web3-eth-contract'; // contract type
import { WebsocketProvider, Account } from 'web3-core';
import chalk from 'chalk';
let fs = require('fs');
import { loadCompiledSols } from '../lib/load'; // compiling and loading ABI function
import { parse } from 'path';

let historySize = 100;
//let head: number;

type ArrayIndexable = {
    [tokenId: number]: number;
}

interface TreeNode {
    tokenId: number;
    child: number;
    owners: string[];
    sources: TreeNode[];
}

type Mutable<Type> = {
    -readonly [Key in keyof Type]: Type[Key];
  };

export function initialiseContract(web3: Web3, contractAddress: string): Contract {
    try {
        let loaded = loadCompiledSols(["MeatNFT"]);
        //console.log(loaded);
        return new web3.eth.Contract(loaded.contracts["MeatNFT"]["MeatNFT"].abi, contractAddress);
    } catch (error) {
        throw chalk.redBright("Cannot read contract " + error);
    }
}

export function initialiseProvider(): WebsocketProvider {
    try {
        let provider_data = fs.readFileSync('json/providers.json');
        let provider_json = JSON.parse(provider_data);
        let provider_link = provider_json["provider_link"];
        return new Web3.providers.WebsocketProvider(provider_link);
    } catch (error) {
        throw chalk.redBright("Cannot read provider: " + error);
    }
}

export function addWallet(web3: Web3, privateKey: string): Account {
    try {
        return web3.eth.accounts.wallet.add(privateKey)
    } catch (error) {
        throw(chalk.redBright("Cannot add wallet: " + error));
    }
}

export async function getBalance(web3: Web3, account: Account): Promise<string> {
    try {
        return await web3.eth.getBalance(account.address);
    } catch (error) {
        throw(chalk.redBright("Cannot get balance: " + error));
    }
}

export async function getTokenInfo(contract: Contract, tokenId: number) {
    let meatInfo: Object;
    try {
        meatInfo = await contract.methods.idToInfo(tokenId).call();
    } catch (error) {
        return [];
    }
    return meatInfo;
}

export async function getTokenOwners(contract: Contract, tokenId: number) {
    let meatInfo: Object;
    try {
        meatInfo = await contract.methods.ownersHistory(tokenId).call();
    } catch (error) {
        return [];
    }
    return meatInfo;
}

export async function getTokenHistory(contract: Contract, tokenId: number) {
    let meatHistory: TreeNode[];
    try {
        meatHistory = await contract.methods.getHistory(tokenId, historySize).call();
    } catch (error) {
        return [];
    }
    let history: TreeNode[] = [];
    meatHistory.forEach(function(token) {
        if (token.tokenId != 0) {
            history.push({"tokenId": token.tokenId, "child": token.child, "owners": token.owners, "sources": [] as TreeNode[]})
        }
    })
    
    return parseHistory(history, tokenId, history[0]);
}


export function parseHistory(historylist: TreeNode[], head: number, reference: TreeNode) {
    // get list of nodes with child head
    // for each  in the list 
    if (historylist.length == 0) {
        return;
    }
    let temp: TreeNode[] = [];
    let temp2: TreeNode[] = [];
    historylist.forEach(function(token) {
        if (token.child == head) {
            temp.push(token)
        } else {
            temp2.push(token)
        }
    });
    temp.forEach(function(token) {
        parseHistory(temp2, token.tokenId, token);
    })
    reference.sources = temp;
    return reference;
}


