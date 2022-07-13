# COMP6452-Project-2
Blockchain Management of Beef Supply Chain


## Sections

### Split merge contract (Zac)
  * GetAllTokens(tokens[], input struct, output struct) store AllNewTokens[] on chain; 
  * emit event whenever a split/merge happens to oracle
  
### Oracle (Cooper)
  * Sync essential data(database and on-chain) when create/destruct event happens
  
### Tokenisation contract (Michael ERC-721, Marcus Voting)
  * minting_contract()
  * self-destruct(only from the owner of the token)
  * ERC-721
  * Vote(sender == regulator)
  * Final_vote() 
  * data: (enum)grading,
          (address)precedence token,
          (string)short description,
          (int)weight of meet,
          (address)original farmer ID

### Database (Cooper)
  * 

### Consumer UI (Marcus)
  *  

### Business UI (Cooper)
  * create_contract(only by farmer, struct description of item) 
    * create token contract
    * store contract value and item in database

### Regulator UI (Marcus)
