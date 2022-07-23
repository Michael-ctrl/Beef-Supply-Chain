// This program is a library which will be used by the CLI
// It can be tested programmatically

import { Address } from 'cluster';
import Web3 from 'web3';
import { WebsocketProvider, Account } from 'web3-core';
import chalk from 'chalk';
let fs = require('fs');

export function initializeProvider(): WebsocketProvider {
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
        let newWallet: Account = web3.eth.accounts.wallet.add(privateKey)
        return newWallet;
    } catch (error) {
        throw(chalk.redBright("Cannot add wallet: " + error));
    }
}