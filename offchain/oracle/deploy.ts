import Web3 from 'web3';
import { Account } from 'web3-core';
import { Contract, DeployOptions } from 'web3-eth-contract';

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
