// This program is a library which will be used by the CLI
// It can be tested programmatically

import Web3 from 'web3';
import { WebsocketProvider, Account } from 'web3-core';
let fs = require('fs');

export default class {
    web3: WebsocketProvider
    businessWallet: Account
    SupplyChain: any

    constructor (SupplyChain: WebsocketProvider, businessWallet: Account) {
        this.web3 = initializeProvider()

        this.SupplyChain = SupplyChain
        this.businessWallet = businessWallet
        
    }
}

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