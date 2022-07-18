import { Contract } from 'web3-eth-contract';

export function handleRequestEvent(contract: Contract, grabData: Function) {
    contract.events["request(uint256,address,bytes)"]()
        .on("connected", function (subscriptionId: any) {
            console.log("listening on event 'request'" + ", subscriptionId: " + subscriptionId);
        })
        .on('data', function (event: any) {
            let caller = event.returnValues.caller;
            let requestId = event.returnValues.requestId;
            let data = event.returnValues.data;
            grabData(caller, requestId, data);
        })
        .on('error', function (error: any, receipt: any) {
            console.log(error);
            console.log(receipt);
            console.log("error listening on event 'request'");
        });
}