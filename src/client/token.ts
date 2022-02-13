
import {
    Blockhash,
    Connection,
    FeeCalculator,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    Transaction
} from '@solana/web3.js';

import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';

import fs from 'mz/fs';
import path from 'path';
import * as borsh from 'borsh';

import { getPayer, getRpcUrl, createKeypairFromFile, getAndLogSolBalance } from './utils';
import { Key } from 'mz/readline';
import { getRedeemPrintingV2BidTransactions } from '@metaplex/js/lib/actions';


var connection: Connection;

var payer: Keypair;


export async function establishConnection(): Promise<Connection> {
    const rpcUrl = await getRpcUrl();
    connection = new Connection(rpcUrl, 'confirmed');
    const version = await connection.getVersion();
    console.log('Connection to cluster established:', rpcUrl, version);
    return connection;
}

export function establishPayer(keypair: Keypair) {
    payer = keypair;
};



class MintToken {
    constructor(public mintAuthority: Keypair, public mint: Token) {
    }
    /**
     * name
     */
    public name() {

    }
}

export async function createMintToken(mintAuthorityPubkey: PublicKey, decimals: number, amount: number) {
    let bal = await getAndLogSolBalance(payer.publicKey, connection);

    const mint = await Token.createMint(
        connection,
        payer,
        mintAuthorityPubkey,
        null,
        decimals,
        TOKEN_PROGRAM_ID
    );
    console.log('Created token', mint.publicKey.toBase58());
    let newBal = await getAndLogSolBalance(payer.publicKey, connection);

    console.log('Payer payed', bal - newBal, 'SOL transaction fee');

    const accountAddress = await mint.createAssociatedTokenAccount(mintAuthorityPubkey);
    await getAndLogSolBalance(payer.publicKey, connection);

    await mint.mintTo(accountAddress, mintAuthorityPubkey, [], LAMPORTS_PER_SOL * amount);

    await getAndLogSolBalance(payer.publicKey, connection);
}
