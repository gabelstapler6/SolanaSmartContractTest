# Sphere

Install <a href=https://www.rust-lang.org/tools/install>Rust</a> and <a href=https://docs.solana.com/cli/install-solana-cli-tools>Solana</a>.

  - [Solana CLI Commands](#solana-cli-commands)
    - [Print configuration](#print-configuration)
    - [Switch Network](#switch-network)
    - [Generate new Keypair](#generate-new-keypair)
    - [Show public key of keypair](#show-public-key-of-keypair)
    - [Set default keypair for solana cli](#set-default-keypair-for-solana-cli)
    - [Airdrop sol to default keypair (devnet)](#airdrop-sol-to-default-keypair-devnet)
    - [Balance of default keypair](#balance-of-default-keypair)
    - [Get Keypair of Phantom wallet](#get-keypair-of-phantom-wallet)
  - [SPL Token Commands](#spl-token-commands)
    - [Create fungible token](#create-fungible-token)
    - [Print supply of token](#print-supply-of-token)
    - [Create on-chain account to hold token balance](#create-on-chain-account-to-hold-token-balance)
    - [Mint tokens into account](#mint-tokens-into-account)
    - [Show all tokens that default keypair owns](#show-all-tokens-that-default-keypair-owns)
    - [Transfer token to other wallet](#transfer-token-to-other-wallet)
    - [Transfer token to other wallet with sender funding](#transfer-token-to-other-wallet-with-sender-funding)
    - [Create NFT (non fungible token)](#create-nft-non-fungible-token)
    - [Create on-chain account to hold nft (same way as fungible)](#create-on-chain-account-to-hold-nft-same-way-as-fungible)
    - [Mint one and only token into account](#mint-one-and-only-token-into-account)
    - [Disable future minting of token](#disable-future-minting-of-token)


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

