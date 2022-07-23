# COMP6452-Project-2
Blockchain Management of Beef Supply Chain


## Sections

### Split merge contract (Zac)
  * GetAllTokens(tokens[], input struct, output struct) store AllNewTokens[] on chain; 
  * emit event whenever a split/merge happens to oracle
  
### Reverse Oracle (Cooper)
  * Listen for creation events to create new reference to meat
  * When split/merge occurs record new `tokenURI` which represents the meat now
  
### Database (Cooper)
  * Receive new `tokenURI` from the reverse oracle
  * Receive images linked to `tokenId` from business UI
  * Serve images to regulator UI
  
### Tokenisation contract (Michael ERC-721, Marcus Voting)
  * self-destruct(only from the owner of the token)
  * ERC-721
  * Vote(sender == regulator)
  * Final_vote() 
  * Data: (enum)grading,
          (address)precedence token,
          (string)short description,
          (int)weight of meet,
          (address)original farmer ID

### Minting_contract (Zac)
 * create the tokenisation contract() return address[] contract

### Consumer UI (Marcus)
  *  Trace back supply chain by the given contract ID
  * Example output (not final):
  ```
==========================================
Supply Chain for Token 0x323746736269
==========================================
[1] 0x43590435094370 - Farmer Joe Inc.
[2] 0x42395070972373 - Abattoir Pty. Ltd.
...
[n] 0x40389435773721 - Local Butcher Co.
The above list should actually be a tree-like structure

     Farmer A Co.    Farmer B Co.
     0x4456669423    0x4038756732
        \                /
         \              /
         Mincer Pty. Ltd.
         0x54845739367934
                |
                |
         Local Butcher Co.
         0x348057643567834
  
==========================================
Information for Token 0x323746736269
==========================================
Description: Prime Rib
Weight: 300g
Grade: 7
```
 * Names for businesses supplied by offchain database, register name through business UI
 * Supply chain implemented by recursive calls through blockchain

### Business UI (Cooper)
  * Enter private key to open the wallet
  * Support all necessary ERC-721 methods which the business requires
  * Include a way to send the token to the voting contract

### Regulator UI (Marcus)
  *  Vote the meet by the given token ID
