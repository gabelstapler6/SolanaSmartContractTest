

import { Connection, Keypair } from '@solana/web3.js';
import { createMintToken, establishConnection, establishPayer, createAndMintToken } from './token';
import { createKeypairFromFile, getAndLogSolBalance, getPayer, requestAirdrop } from './utils';

global.TextEncoder = require('util').TextEncoder;

async function main() {
    let connection = await establishConnection();
    let payerKeypair: Keypair = await getPayer();
    establishPayer(payerKeypair);

    // await createAndMintToken(payerKeypair.publicKey, 0, 1);
    await createMintToken(payerKeypair.publicKey, 0, 1);
    console.log("seperate transaction");
    await createAndMintToken(payerKeypair.publicKey, 0, 1);
}

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);