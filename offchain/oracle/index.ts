import Web3 from 'web3'; // web3.js library
import { WebsocketProvider, Account } from 'web3-core'; // provider for blockchain and account type
import { Contract } from 'web3-eth-contract'; // contract type
import { loadCompiledSols } from './load'; // compiling and loading ABI function
import { deployContract } from './deploy'; // deployment function (for testing)
import { Address } from 'cluster'; // Address type
let fs = require('fs');

// Read the blockchain provider from the providers.json file and return a Web3 provider
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

// Read the requested account from the accounts.json file and return an AddedAccount
function getAccount(web3: Web3, name: string): Account {
    try {
        let account_data = fs.readFileSync('json/accounts.json');
        let account_json = JSON.parse(account_data);
        let account_pri_key = account_json[name]["pri_key"];
        return web3.eth.accounts.wallet.add('0x' + account_pri_key);
    } catch (error) {
        throw "Cannot read account";
    }
}

// Initialise the args variable by removing the first two parts of the array (node and the program name)
var shellArgs = process.argv.slice(2);
if (shellArgs.length < 1) {
    console.error("node programName contract e.g. node index.js SplitMerge.sol")
    process.exit(1);
}

(async function run() {
    // Setup the web3 object with the provider
    let web3Provider!: WebsocketProvider;
    let web3!: Web3;
    try {
        web3Provider = initializeProvider();
        web3 = new Web3(web3Provider);
    } catch (e) {
        throw "Web3 cannot be initialized";
    }

    var cmd0 = shellArgs[0];

    // Deploy contract to be listened to and return address
    if (cmd0 == "deploy") {
        if (shellArgs.length < 2) {
            console.error("e.g. node index.js deploy MeatNFT");
            process.exit(1);
        }

        if (shellArgs[1] == "MeatNFT") {
            try {
                let account = getAccount(web3, "user");
                let loaded = loadCompiledSols(["MeatNFT"]);
                //console.log(loaded)
                let contract = await deployContract(web3!, account, loaded.contracts["MeatNFT"]["MeatNFT"].abi, loaded.contracts["MeatNFT"]["MeatNFT"].evm.bytecode.object);
                console.log("user app contract address: " + contract.options.address);
            } catch (error) {
                console.error("error deploying contract");
                console.error(error);
            }
        } else {
            console.error("Unknown contract");
            process.exit(1);
        }
        web3Provider.disconnect(1000, 'Normal Closure');

    // Listen to contract events
    } else if (cmd0 = "listen") {
        if (shellArgs.length < 3) {
            console.error("e.g. node index.js listen contractAddress");
            process.exit(1);
        }

        if (shellArgs[1] == "MeatNFT") {
            // Load the contract to be listened to
            let contract!: Contract;
            try {
                let loaded = loadCompiledSols(["MeatNFT"]);
                contract = new web3.eth.Contract(loaded.contracts["MeatNFT"]["MeatNFT"].abi, shellArgs[1]);
            } catch (error) {
                console.error("error loading contract for listening");
                console.error(error);
            }

            // Listen for minting events (as emitted by the SC)
            contract.events.Mint()
                .on("connected", function(subscriptionId: any) {
                    console.log("Listening for event 'Mint', subscriptionId: " + subscriptionId); // just log for now
                })
                .on("data", function(event: any) {
                    console.log(event);
                })
                .on('error', function (error: any, receipt: any) {
                    console.log(error);
                    console.log(receipt);
                    console.log("error listening on event 'Mint'");
                });

        } else {
            console.error("Unknown contract for listening");
            process.exit(1);
        }    
    }
})();