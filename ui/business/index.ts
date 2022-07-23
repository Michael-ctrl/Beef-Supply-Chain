import chalk from 'chalk'
import Web3 from 'web3'
import { WebsocketProvider, Account } from 'web3-core'
import { addWallet, initializeProvider } from './business'

var vorpal = require('vorpal')();

let web3: Web3 = new Web3(initializeProvider());
let account: Account;

// Wallet Setup Command
vorpal
    .command('setupwallet', 'Setup the business wallet')
    .option('-k, --key <privateKey>', 'Private key of the wallet')
    .types({
        string: ['k', 'key']
    })
    .action(function (this: any, args: any, callback: any) {
        const self = this;

        if (!args.options.key) {
            return self.prompt({
                type: 'input',
                name: 'key',
                message: 'Enter your private key: ',
            }, function(result: any) {
                account = addWallet(web3, result.key);
                self.log(chalk.greenBright('Wallet added successfully'));
                callback();
            })
        } else {
            account = addWallet(web3, args.options.key);
            self.log(chalk.greenBright('Wallet added successfully'));
            callback();
        }
    });

// List Tokens in Wallet Command
vorpal
    .command('check', 'List tokens in your wallet')
    .alias('balance')
    .action(async function (this: any, args: any, callback: any) {
        const self = this;
        if (!account) {
            self.log(chalk.redBright('Error: ') + 'Please setup your wallet with ' + chalk.gray('setupwallet'));
            callback();
        } else {
            // Get balance in ether
            let balance = await web3.eth.getBalance(account.address);
            self.log('Balance: ' + web3.utils.fromWei(balance, 'ether') + ' ETH');

            // Get list of NFTs
            
            callback();
        }
    });

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
  
vorpal
    .delimiter('business > ')
    .run(process.argv)
    .show();