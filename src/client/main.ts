

import { Connection, Keypair } from '@solana/web3.js';
import { establishConnection, createAndMintNFT } from './token';
import { createKeypairFromFile, getPayer, requestAirdrop } from './utils';

global.TextEncoder = require('util').TextEncoder;

async function main() {
    let connection = await establishConnection();
    let minter: Keypair = await getPayer();
    await createAndMintNFT(minter);
}

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);