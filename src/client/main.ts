

import { Connection, Keypair } from '@solana/web3.js';
import { createMintToken, establishConnection, establishPayer } from './token';
import { createKeypairFromFile, getAndLogSolBalance, getPayer, requestAirdrop } from './utils';

global.TextEncoder = require('util').TextEncoder;

async function main() {
    let connection = await establishConnection();
    let payerKeypair: Keypair = await createKeypairFromFile("/home/andi/Development/Projects/Sphere/phantom.json");
    establishPayer(payerKeypair);
    await createMintToken(payerKeypair.publicKey, 9, 100);
}

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);