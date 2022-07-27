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

type TreeNode = {
    tokenId: number;
    child: number;
    owners: string[];
    sources: TreeNode[];
}

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
    return parseHistory(meatHistory, tokenId);
}

export function parseHistory(history: TreeNode[], head: number) {
    //Map tokenId to Array index
    let idMap: ArrayIndexable;
    const idMapping = history.reduce((acc: ArrayIndexable, token: TreeNode, i) => {
        acc[token.tokenId] = i;
        return acc;
      }, {});

    let tree: TreeNode = {"tokenId": 0, "child": 0, "owners": [], "sources": []};
    history.forEach(function(token) {
        // Handle Empty info
        if(token.tokenId == 0) {
            return;
        }
        // process owners to have name;
        token.owners.forEach(function(owner: string) {
            return owner = owner + ': ' + getOwnerName(owner)
        });
        // Handle token head
        if(token.tokenId == head) {
            tree = {"tokenId": token.tokenId, "child": 0, "owners": token.owners, "sources": []};
        } else {
            let child = history[idMap[token.child]]
            let node = {"tokenId": token.tokenId, "child": token.child, "owners": token.owners, "sources": []};
            child["sources"].push(node);
        }
    });
    return tree;
}

function getOwnerName(address: string) {
    // implement get owner name from offchain database
    return 'Steves Farm'
}