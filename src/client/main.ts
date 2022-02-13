

import { Connection, Keypair } from '@solana/web3.js';
import { createMintToken, establishConnection, establishPayer } from './token';
import { createKeypairFromFile, getAndLogSolBalance, getPayer, requestAirdrop } from './utils';

global.TextEncoder = require('util').TextEncoder;

async function main() {
    let connection = await establishConnection();
    let payerKeypair: Keypair = await getPayer();
    establishPayer(payerKeypair);
    await createMintToken(payerKeypair.publicKey, 0, 1);
}

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);