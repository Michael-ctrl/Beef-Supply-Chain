// This program is a library which will be used by the CLI
// It can be tested programmatically

import Web3 from 'web3';
import { Contract } from 'web3-eth-contract'; // contract type
import { WebsocketProvider, Account } from 'web3-core';
import chalk from 'chalk';
let fs = require('fs');
import { loadCompiledSols } from '../lib/load'; // compiling and loading ABI function

export function initialiseContract(web3: Web3, contractAddress: string): Contract {
    try {
        let loaded = loadCompiledSols(["Voting"]);
        //console.log(loaded);
        return new web3.eth.Contract(loaded.contracts["Voting"]["Voting"].abi, contractAddress);
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

export async function getTokens(web3: Web3, contract: Contract, account: Account) {
    // Get number of tokens
    let numTokens = contract.methods.balanceOf(account.address).call();

    // Get list of NFTs
    let tokens = [];
    for (let i = 0; i < numTokens; i++) {
        tokens.push(await contract.methods.tokenOfOwnerByIndex(account.address, i).call());
    }

    return tokens;
}

export async function getVotingMeat(web3: Web3, contract: Contract, account: Account) {
    // Get number of tokens
    let CurrentMeat: number;
    try {
        CurrentMeat = await contract.methods.CurrentMeat().call();
    } catch (error) {
        return [];
    }
    return CurrentMeat;
}