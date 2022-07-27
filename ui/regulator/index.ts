import chalk from 'chalk'
import Web3 from 'web3'
import { Account } from 'web3-core'
import { Contract } from 'web3-eth-contract'; // contract type

// library import
import { addWallet, getBalance, getTokens, initialiseContract, initialiseProvider } from './regulator'
import { methodSend } from '../lib/transact'
let fs = require('fs');
// firebase import
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, addDoc, updateDoc, getDoc} from "firebase/firestore";
import { getStorage, ref, uploadString, uploadBytes,  uploadBytesResumable, getDownloadURL} from "firebase/storage";

var vorpal = require('vorpal')();

let web3: Web3 = new Web3(initialiseProvider());
let account: Account;
let contract: Contract;
let tokens = [];

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
const storage = getStorage(app);

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
        setupcontract(this, args);
        setupwallet(this, args);
        callback();
    });


// Get contract ABI
vorpal
    .command('setupcontract <contractAddress>', 'Connect to the contract')
    .types({string: ['_']})
    .action(function (this:any, args: any, callback: any) {
        setupcontract(this, args);
        callback();
    });

// Wallet Setup
vorpal
    .command('setupwallet <privateKey>', 'Setup the business wallet')
    .types({string: ['_']})
    .action(function (this: any, args: any, callback: any) {
        setupwallet(this, args);
        callback();
    });

// Upload image
vorpal
    .command('upload', 'Upload data')
    .option('-i, --tokenURI <tokenURI>')
    .option('-u, --file <file>', 'Path to image to be uploaded')
    .types({string: ['i', 'tokenURI', 'u', 'file']})
    .action(function (this:any, args: any, callback: any) {
        uploadImage(this, args);
        callback();
    });

// Update data
vorpal
    .command('update', 'Update data')
    .option('-i, --tokenURI <tokenURI>', 'tokenURI')
    .option('-b, --body_number <body_numer>', 'MSA data')
    .option('-l, --lot_number <lot_number>')
    .option('-c, --carcass_weight <carcase_weight>')
    .option('-s, --sex <sex>')
    .option('-t, --tropical_breed_content <tropical_breed_content> ')
    .option('-h, --hanning_method <hanging_method>')
    .option('-g, --hormonal_growth <hormonal_growth>')
    .option('-o, --ossification <ossification>')
    .option('-m, --marbling <marbling>')
    .option('-r, --rib_fat <rib_fat>')
    .option('-p, --ph <ph>')
    .option('-e, --temperature <temperature>')
    .option('-w, --og_cow <og_cow>', 'Origninal cow ID')
    .option('-u, --imageURL <image_URL>')
    .types({string: ['i', 'tokenURI']})
    .action(function (this:any, args: any, callback: any) {
        doUpload(this, args);
        callback();
    });

// get url
vorpal
.command('getURL', 'Get image URL data')
.option('-i, --tokenURI <tokenURI>', 'tokenURI')
.types({string: ['i', 'tokenURI']})
.action(function (this:any, args: any, callback: any) {
    getURL(this, args);
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

// Voting
vorpal
    .command('vote', 'Vote on meat')
    .option('-g, --grade <grade>', 'Item grade', null, 0)
    .option('-t, --tokenid <tokenid>', 'Token ID', null, 0)
    .option('-k, --key <key>', 'Validation key', null, 0)
    .action(async function (this: any, args: any, callback: any) {
        const self = this;
        if (!account) {
            self.log(chalk.redBright('Error: ') + 'Please setup your wallet with ' + chalk.gray('setupwallet'));
        } else {
            if (!contract) {
                self.log(chalk.redBright('Error: ') + 'Please connect to a contract with ' + chalk.gray('contract <contractAddress>'));
            } else {
                await methodSend(web3, account, contract.options.jsonInterface, 'doVote', contract.options.address, [args.options.grade,args.options.key,args.options.tokenid]);
            }
        }
        callback();
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
function setupcontract (instance: any, args: any) {
    //console.log(instance, args);
    contract = initialiseContract(web3, args.options.contract);
    instance.log(chalk.greenBright('Connected to contract ') + args.options.contract);
}

function setupwallet (instance: any, args: any) {
    const self = instance;
    if (!args.options.key) {
        return instance.prompt({
            type: 'input',
            name: 'privateKey',
            message: 'Enter your private key: ',
        }, function(result: any) {
            account = addWallet(web3, result.privateKey);
        })
    } else {
        account = addWallet(web3, args.options.key);
    }
    instance.log(chalk.greenBright('Wallet added ') + account.address);
}

async function getURL(instance: any, args: any){
    if(args.options.tokenURI){
        const docRef = doc(db, "meatNFTs", args.options.tokenURI);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            // Convert to City object
            const meat = docSnap.data();
            // Use a City instance method
            instance.log(meat.image);
          } else {
            instance.log("No such document!");
          }
    }else{
        instance.log("No token id provided");
    }
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

async function uploadImage(instance: any, args: any){
    let date = Date.now();
    const storageRef = ref(storage, 'images/'+ date +'.jpg');
    if(args.options.file){
        let a_file = fs.readFileSync(args.options.file, {encoding: 'base64'});
        // Upload the file and metadata
        const uploadTask = uploadString(storageRef, a_file, 'base64').then((snapshot) => {
            instance.log('Uploaded file!'); 
            getDownloadURL(snapshot.ref).then((downloadURL) => {
                instance.log('File available at', downloadURL);
                if(args.options.tokenURI){
                    const docRef = doc(db, "meatNFTs", args.options.tokenURI);
                    updateDoc(docRef, { ["image"]: downloadURL});
                }
            }); 
            
        });
    }
}

async function doUpload(instance: any, args: any){
    const docRef = doc(db, "meatNFTs", args.options.tokenURI);
    if(args.options.body_number){
        await updateDoc(docRef, { ["msa_grading.body_number"]: args.options.body_number});
    }
    if(args.options.lot_number){
        await updateDoc(docRef, { ["msa_grading.lot_number"]: args.options.lot_number});
    }
    if(args.options.carcass_weight){
        await updateDoc(docRef, { ["msa_grading.carcass_weight"]: args.options.carcass_weight});
    }
    if(args.options.sex){
        await updateDoc(docRef, { ["msa_grading.sex"]: args.options.sex});
    }
    if(args.options.tropical_breed_content){
        await updateDoc(docRef, { ["msa_grading.tropical_breed_content"]: args.options.tropical_breed_content});
    }
    if(args.options.hanning_method){
        await updateDoc(docRef, { ["msa_grading.hanging_method"]: args.options.hanning_method});
    }
    if(args.options.hormonal_growth){
        await updateDoc(docRef, { ["msa_grading.hormonal_growth"]: args.options.hormonal_growth});
    }
    if(args.options.ossification){
        await updateDoc(docRef, { ["msa_grading.ossification"]: args.options.ossification});
    }
    if(args.options.marbling){
        await updateDoc(docRef, { ["msa_grading.marbling"]: args.options.marbling});
    }
    if(args.options.rib_fat){
        await updateDoc(docRef, { ["msa_grading.rib_fat"]: args.options.rib_fat});
    }
    if(args.options.ph){
        await updateDoc(docRef, { ["msa_grading.ph"]: args.options.ph});
    }
    if(args.options.temperature){
        await updateDoc(docRef, { ["msa_grading.temperature"]: args.options.temperature});
    }
    if(args.options.og_cow){
        await updateDoc(docRef, { ["og_cow"]: args.options.og_cow});
    }
    if(args.options.imageURL){
        await updateDoc(docRef, { ["image"]: args.options.imageURL});
    }
}

vorpal
    .delimiter('regulator > ')
    .run(process.argv)
    .show();