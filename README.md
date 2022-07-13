# COMP6452-Project-2
Blockchain Management of Beef Supply Chain


## Sections

### Split merge contract (Zac)
  * GetAllTokens(tokens[], input struct, output struct) store AllNewTokens[] on chain;
  
### Oracle (Cooper)
  * Sync essential data(database and on-chain) when create/destruct event happens

### Tokenisation contract (Michael ERC-721, Marcus Voting)
  * self-destruct(only from the owner of the token)
  * ERC-721
  * Vote(sender == regulator) 

  * data: grading, array of previous token

### Database (Cooper)
  * Images for grading
  * Farm data connected to source of token

#### Consumer UI (Marcus)
  *  

#### Business UI (Cooper)
  * create_contract(only by farmer, struct description of item) 
    * create token contract
    * store contract value and item in database

#### Regulator UI (Marcus)
