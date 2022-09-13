# Solana Basics

Install <a href=https://www.rust-lang.org/tools/install>Rust</a> and <a href=https://docs.solana.com/cli/install-solana-cli-tools>Solana CLI</a>.

## Solana CLI Commands

### Print configuration 
```
solana config get
```

- Solana RPC Urls

https://api.mainnet.solana.com

https://api.devnet.solana.com

https://api.testnet.solana.com


### Switch Network
```
solana config set --url https://api.devnet.solana.com
```

### Generate new Keypair
```
solana-keygen new --outfile <outfile.json>
```

### Show public key of keypair
```
solana-keygen pubkey <keyfile>
```

### Set default keypair for solana cli
```
solana config set --keypair <keyfile>
```

### Airdrop sol to default keypair (devnet)
```
solana airdrop 1
```

### Balance of default keypair
```
solana balance
```

### Get Keypair of Phantom wallet
- Use 1/0, 2/0 to get next keypairs of the wallet
- Do not enter a passphrase
- Switch to devnet in phantom to see devnet tokens and balance

```
solana-keygen recover 'prompt://?key=0/0' -o <outfile.json>
```


## SPL Token Commands

### Install spl-token
```
cargo install spl-token-cli
```

### Create fungible token
- Prints out unique token id

```
spl-token create-token
```
example token id: 4sKo3cLs77gp2cXvMRVbTRUzp1yTWGfgEkwmdAQBy1YG


### Print supply of token
```
spl-token supply <tokenid>
```

### Create on-chain account to hold token balance
- Prints out account id
- Account created for default keypair in solana cli
```
spl-token create-account <tokenid>
```
example account id: 8AzAHagBCZewSSeELVVcv3tiUmtKd1zJYzCWqSHXGNZx


### Mint tokens into account
```
spl-token mint <tokenid> <amount>
```

### Show all tokens that default keypair owns
```
spl-token accounts
```

### Transfer token to other wallet
- Wallet should have created a account for the token to hold the balance
```
spl-token transfer <tokenid> <amount> <receiverpubkey>
```

### Transfer token to other wallet with sender funding
- Sender creates account for receiver
- Add --allow-unfunded-recipient if receiver has no balance
```
spl-token transfer --fund-recipient <tokenid> <amount> <receiverpubkey>
```

### Create NFT (non fungible token)
- Prints token id
```
spl-token create-token --decimals 0
```
example token id: DroYCMrvicfwpBfJGez8fP9SW4xAMX7YDUF2TrpCwQy6

### Create on-chain account to hold nft (same way as fungible)
```
spl-token create-account <tokenid>
```

### Mint one and only token into account
```
spl-token mint <tokenid> 1
```

### Disable future minting of token
- Not undoable (makes sense)
```
spl-token authorize <tokenid> mint --disable
```

## Spl-Token Multisig

### Create multisig on-chain account
- M number of minimum signers
- N publickeys of the signers (maximum 11)
- Prints out account id of the multisig account
```
spl-token create-multisig <M> <pubkey1> <pubkey2> ... <pubkeyN>
```
example id: CfKTinLq1neoUbnuXYKaEdfR6rRfVjp7NGdv31XapUdk

### Authorize multisig account for mint
```
spl-token authorize <tokenId> mint <multisigAccountId>
```

### Mint tokens with multisig
- Mint amount of tokens into the accountToHoldTokens
- owner needs to be specified (multisgAccount is now the owner because of authorize before)
- Specify N number of signers, must be minimum M
```
spl-token mint <tokenId> <amount> <accountToHoldTokens> --owner <multisigAccountId> --multisig-signer <signer1> ... --multisig-signer <signerN>
```

## Spl Token Mutlisig Offline

### Offline Transaction signing
- ```--sign-only``` option
- transaction is not launched but signature pubkey/signature pair printed out
- ```--blockhash BASE58_HASH``` provide recent blockhash

### Create nonce account
- Create new keypair for nonce account
```
solana-keygen new -o nonce-keypair.json
```
- Create the nonce account
```
solana create-nonce-account <nonce-keypair> <amount>
```
- Print out info about the nonce account
- Prints out ```Nonce Blockhash```, ```Nonce Authority```
- Nonce Blockhash used as ```--blockhash``` argument when signing
- Nonce Authority used as ```--nonce-authority``` argument when signing
```
solana nonce-account <noncePubkey>
```
### Offline signing template command
- Template command
- Each signer needs to run the command and replace his pubkeySigner with the own keypair.json file
- Pubkeys of all signers need to be specified in the ```--multisig-signer``` arguments
- ```--sign-only``` to specify that this is to sign the transaction
- Prints out the Absent signers
- Prints out ```Signers (Pubkey=Signature)```
```
spl-token mint <tokenid> <amount> <destinationAccount> \
--owner <multisignAccountId> \
--multisig-signer <pubkeySigner1> \
--multisig-signer <pubkeySigner2> \
--blockhash <nonceBlockHash> \
--fee-payer <feePayerWalletPubkey> \
--nonce <nonceWalletPubkey> \
--nonce-authority <nonceAuthority> \
--sign-only \
--mint-decimals 9
```

- After each signer runned the command
- Communicate ```Signers (Pubkey=Signature)``` to the one who should do the transaction
- Add the communicated Signatures as ```--signer``` arguments 
```
spl-token mint <tokenId> <amount> <destinationAccount> \
--owner <multisigAccountId> \
--multisig-signer <pubkeySigner1> \
--multisig-signer <pubkeySigner2> \
--blockhash <nonceBlockhash> \
--fee-payer <keyPairFile.json> \
--nonce <nonceWalletPubkey> \
--nonce-authority <keypairFile.json> \
--signer <pubkey=signature1> \
--signer <pubkey=signature2>
```