

import { Connection, Keypair } from '@solana/web3.js';
import { createMetadataForToken } from './metadata';
import { establishConnection, createAndMintNFT } from './token';
import { createKeypairFromFile, getPayer, requestAirdrop } from './utils';

global.TextEncoder = require('util').TextEncoder;

async function main() {
    let connection = await establishConnection();
    let minter: Keypair = await getPayer();
    let tokenAccount = await createAndMintNFT(minter);
    await createMetadataForToken(minter, tokenAccount, connection);
}

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);