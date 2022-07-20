# COMP6452-Project-2
Blockchain Management of Beef Supply Chain


## Sections

### Split merge contract (Zac)
  * GetAllTokens(tokens[], input struct, output struct) store AllNewTokens[] on chain; 
  * emit event whenever a split/merge happens to oracle
  
### Oracle (Cooper)
  * Sync essential data(database and on-chain) when create/destruct event happens
  
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

### Database (Cooper)
  * Images for grading
  * Farm data connected to source of token

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
  * create_contract(only by farmer, struct description of item) 
    * create token contract
    * store contract value and item in database
  * Trace back supply chain by the given contract ID

### Regulator UI (Marcus)
  *  Vote the meet by the given token ID
