
import {
    Blockhash,
    Connection,
    FeeCalculator,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    sendAndConfirmTransaction,
    SystemProgram,
    Transaction
} from '@solana/web3.js';

import { ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';

import fs from 'mz/fs';
import path from 'path';
import * as borsh from 'borsh';

import { getPayer, getRpcUrl, createKeypairFromFile, getAndLogSolBalance } from './utils';
import { Key } from 'mz/readline';
import { getRedeemPrintingV2BidTransactions } from '@metaplex/js/lib/actions';

const TRANSACTION_FEE = 10000;

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

export async function createAndMintToken(mintAuthorityPubkey: PublicKey, decimals: number, amountToMint: number) {

    let balanceNeeded = await Token.getMinBalanceRentForExemptMint(connection);
    balanceNeeded += await Token.getMinBalanceRentForExemptAccount(connection);
    balanceNeeded += TRANSACTION_FEE * 2;

    console.log("balance needed", balanceNeeded);

    let balance = await connection.getBalance(payer.publicKey);

    const mint = await Token.createMint(
        connection,
        payer,
        mintAuthorityPubkey,
        null,
        decimals,
        TOKEN_PROGRAM_ID
    );

    const accountId = await mint.createAssociatedTokenAccount(mintAuthorityPubkey);

    await mint.mintTo(accountId, mintAuthorityPubkey, [], LAMPORTS_PER_SOL * amountToMint);

    // await mint.setAuthority(mint.publicKey, null, 'MintTokens', mintAuthorityPubkey, []);

    let remainingBalance = await connection.getBalance(payer.publicKey);

    console.log("payer payed", balance - remainingBalance);
    console.log("minted", amountToMint, mint.publicKey.toBase58());
}



export async function createMintToken(mintAuthorityPubkey: PublicKey, decimals: number, amount: number) {

    // const token = new Token(
    //     connection,
    //     mintAccount.publicKey,
    //     programId,
    //     payer,
    // );

    const mintAccount = Keypair.generate();

    // Allocate memory for the account
    let balanceNeeded = await Token.getMinBalanceRentForExemptMint(
        connection,
    );
    balanceNeeded += await Token.getMinBalanceRentForExemptAccount(connection);

    console.log("need balance", balanceNeeded);

    let balance = await connection.getBalance(payer.publicKey);

    const transaction = new Transaction();
    transaction.add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mintAccount.publicKey,
            lamports: balanceNeeded,
            space: MintLayout.span,
            programId: TOKEN_PROGRAM_ID,
        }),
    );

    transaction.add(
        Token.createInitMintInstruction(
            TOKEN_PROGRAM_ID,
            mintAccount.publicKey,
            decimals,
            mintAuthorityPubkey,
            null,
        ),
    );

    const associatedAddress = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mintAccount.publicKey,
        mintAuthorityPubkey
    );

    transaction.add(
        Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            mintAccount.publicKey,
            associatedAddress,
            mintAuthorityPubkey,
            payer.publicKey,
        ),
    );

    transaction.add(
        Token.createMintToInstruction(
            TOKEN_PROGRAM_ID,
            mintAccount.publicKey,
            associatedAddress,
            mintAuthorityPubkey,
            [],
            amount
        )
    );

    let response = await sendAndConfirmTransaction(connection, transaction, [payer, mintAccount]);

    console.log(response);
    console.log("minted", amount, mintAccount.publicKey.toBase58());

    let newBalance = await connection.getBalance(payer.publicKey);

    console.log("payer payed", balance - newBalance);
}
