import chalk from 'chalk'
import Web3 from 'web3'
import { Account } from 'web3-core'
import { Contract } from 'web3-eth-contract'; // contract type

import { addWallet, getBalance, initialiseContract, initialiseProvider, getTokenInfo, getTokenHistory, getTokenOwners } from './consumer'
import { methodSend } from '../lib/transact'

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, addDoc, updateDoc, getDoc} from "firebase/firestore";
var vorpal = require('vorpal')();

let web3: Web3 = new Web3(initialiseProvider());
let account: Account;
let contract: Contract;

// Initialization for firebase
const firebaseConfig = {
    apiKey: "AIzaSyDE4B921jYQ2nsOeRk5qZwkKzkowc-u8vI",
    authDomain: "meatnft-1385e.firebaseapp.com",
    projectId: "meatnft-1385e",
    storageBucket: "meatnft-1385e.appspot.com",
    messagingSenderId: "242420508999",
    appId: "1:242420508999:web:0d4c4af6c0306d4b50c462"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
// Easy Setup from CLI
vorpal
    .command('setup', 'Easy setup')
    .hidden()
    .option('-k, --key <privateKey>', 'Private key of your wallet')
    .option('-c, --contract <contractAddress>', 'Address of the NFT contract')
    .types({
        string: ['k', 'key', 'c', 'contract']
    })
    .action(function (this:any, args: any, callback: any) {
        setupcontract(this, args.options.contract);
        setupwallet(this, args.options.key);
        callback();
    });


// Get contract ABI
vorpal
    .command('setupcontract <contractAddress>', 'Connect to the contract')
    .types({string: ['_']})
    .action(function (this:any, args: any, callback: any) {
        setupcontract(this, args.contractAddress);
        callback();
    });

// Wallet Setup
vorpal
    .command('setupwallet <privateKey>', 'Setup the b wallet')
    .types({string: ['_']})
    .action(function (this: any, args: any, callback: any) {
        setupwallet(this, args.privateKey);
        callback();
    });

// get data
vorpal
    .command('getData', 'Get image URL data')
    .option('-i, --tokenURI <tokenURI>', 'tokenURI')
    .types({string: ['i', 'tokenURI']})
    .action(function (this:any, args: any, callback: any) {
        getData(this, args);
        callback();
    });

    
vorpal
    .command('viewMeatHistory <tokenId>', 'View History and grading data of original cows')
    .action(async function (this: any, args: any, callback: any) {
        const self = this;
        if (!account) {
            self.log(chalk.redBright('Error: ') + 'Please setup your wallet with ' + chalk.gray('setupwallet'));
            callback();
        } else {
            // Get balance in ether
            self.log(chalk.greenBright('Balance: ') + web3.utils.fromWei(await getBalance(web3, account), 'ether') + ' ETH');

            if (!contract) {
                self.log(chalk.redBright('Error: ') + 'Please connect to a contract with ' + chalk.gray('contract <contractAddress>'));
            } else {
                let meatHistory: any = {};
                meatHistory = await getTokenHistory(contract, args.tokenId);
                let str = JSON.stringify(meatHistory);
                str = JSON.stringify(meatHistory, null, 4);
                self.log(str);
            }
            callback();
        }
    });

vorpal
    .command('viewMeatInfo <tokenId>', 'View on-chain info of any token')
    .action(async function (this: any, args: any, callback: any) {
        const self = this;
        if (!account) {
            self.log(chalk.redBright('Error: ') + 'Please setup your wallet with ' + chalk.gray('setupwallet'));
            callback();
        } else {
            // Get balance in ether
            self.log(chalk.greenBright('Balance: ') + web3.utils.fromWei(await getBalance(web3, account), 'ether') + ' ETH');

            if (!contract) {
                self.log(chalk.redBright('Error: ') + 'Please connect to a contract with ' + chalk.gray('contract <contractAddress>'));
            } else {
                let meatInfo: any = [];
                meatInfo = await getTokenInfo(contract, args.tokenId);
                let meatOwners: any = [];
                meatOwners = await getTokenOwners(contract, args.tokenId);
                self.log(meatInfo);
                self.log(chalk.gray('List of owners of this piece of meat'));
                self.log(meatOwners);
            }
            callback();
        }
    });

// Used instead of vorpal.parse, just removes the process.exit so the CLI can be used
// Doesn't support the minimist option to reduce unnecessary imports
vorpal.run = function (argv: any, options: any, done: any) {
    // Modification of code found here: https://github.com/dthree/vorpal/blob/master/lib/vorpal.js#L155-L184
    // Get reference to loadsh attached to vorpal.
    var _ = this.lodash;
  
    options = options || {};
    var args = argv;
    var result = this;
    var catchExists = !(_.find(this.commands, {_catch: true}) === undefined);
    args.shift();
    args.shift();
    if (args.length > 0 || catchExists) {
        // Wrap the spaced args back in quotes.
        for (let i = 0; i < args.length; ++i) {
            if (i === 0) {
                continue;
            }
            if (args[i].indexOf(' ') > -1) {
                args[i] = `"${args[i]}"`;
            }
        }
        this.exec(args.join(' '), function (err: any) {
        if (err !== undefined && err !== null) {
            throw new Error(err);
        }
        
        // NOTE: Here is where I got rid of the process exit.
        // and replaced with a promise.
        if (done) { done(); }
  
        // process.exit(0);
        });
    }
    return result;
};

// Helper functions
function setupcontract (instance: any, address: string) {
    contract = initialiseContract(web3, address);
    instance.log(chalk.greenBright('Loaded contract ABI for ') + address);
}

async function getData(instance: any, args: any){
    if(args.options.tokenURI){
        const docRef = doc(db, "meatNFTs", args.options.tokenURI);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            // Convert to City object
            const meat = docSnap.data();
            // Use a City instance method
            instance.log(meat);
          } else {
            instance.log("No such document!");
          }
    }else{
        instance.log("No token id provided");
    }
}

function setupwallet (instance: any, key: string) {
    const self = instance;
    account = addWallet(web3, key);
    instance.log(chalk.greenBright('Wallet added ') + account.address);
}

vorpal
    .delimiter(chalk.green('consumer') + ' > ')
    .run(process.argv)
    .show();
