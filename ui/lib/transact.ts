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

    let gasPrice = await getGasPrice(web3);

    let gas;

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

// Send ether to address
export async function sendEther(web3: Web3, from: string, to: string, amount:string): Promise<any> {
    let gasPrice = await getGasPrice(web3);
    
    web3.eth.sendTransaction({
        from: from,
        to: to,
        value: amount,
        gasPrice: gasPrice,
        gas: Helper.gasPay(await web3.eth.estimateGas({from: from, to: to, value: amount})),
    }).then(function (receipt: any) {
        return receipt;
    }).catch((ee: any) => {
        console.error(ee);
    });
}

async function getGasPrice(web3: Web3): Promise<any> {
    await web3.eth.getGasPrice().then((averageGasPrice) => {
        // console.log("Average gas price: " + averageGasPrice);
        return averageGasPrice;
    }).catch(console.error);
}