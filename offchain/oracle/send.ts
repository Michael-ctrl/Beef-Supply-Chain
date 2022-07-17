import Web3 from 'web3';
import { Account } from 'web3-core';

class Helper {
    static gas_mulptiplier: number = 1.2;
    static gasPay(gas: number) {
        return Math.ceil(gas * Helper.gas_mulptiplier);
    }
}

export async function methodSend(web3: Web3, account: Account, abi: any, methodName: string, address: string, args: any[]): Promise<any> {

    let a_contract = new web3.eth.Contract(abi, address, {
    });

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

    // console.log("sending...");
    return a_contract.methods[methodName](...args).send({
        from: account.address,
        gasPrice: gasPrice,
        gas: Helper.gasPay(await a_contract.methods[methodName](...args).estimateGas({ from: account.address })),
    }).then(function (receipt: any) {
        return receipt;
    }).catch((ee: any) => {
        console.error(ee);
    });
}
