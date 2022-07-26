import Web3 from 'web3';
import { Account, WebsocketProvider } from 'web3-core';
import { loadCompiledSols } from '../lib/load';
import chalk from 'chalk';
import { Contract, DeployOptions } from 'web3-eth-contract';

let fs = require('fs');

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

class Helper {
    static gas_mulptiplier: number = 1.2;
    static gasPay(gas: number) {
        return Math.ceil(gas * Helper.gas_mulptiplier);
    }
}

export async function deployContract(web3: Web3, account: Account, abi: any, data: string, args?: any[]): Promise<Contract> {

    let a_contract = new web3.eth.Contract(abi, undefined, {
        data: '0x' + data
    });

    let a_instance: Contract;

    let gasPrice;

    await web3.eth.getGasPrice().then((averageGasPrice) => {
        // console.log("Average gas price: " + averageGasPrice);
        gasPrice = averageGasPrice;
    }).catch(console.error);

    let gas;

    await web3.eth.getBalance(account.address).then((account_balance) => {
        // console.log("Gas in wallet: " + account_balance);
    }).catch((err) => {

    });

    // console.log("deploying...");
    await a_contract.deploy({ data: a_contract.options.data, arguments: args } as DeployOptions).send({
        from: account.address,
        gasPrice: gasPrice,
        gas: Helper.gasPay(await a_contract.deploy({ data: a_contract.options.data, arguments: args } as DeployOptions).estimateGas({ from: account.address })),
    }).then((instance) => {
        a_instance = instance;
    }).catch(console.error);

    return a_instance!;
}
