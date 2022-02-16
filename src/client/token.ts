
import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    sendAndConfirmTransaction,
    SystemProgram,
    Transaction,
    FeeCalculator,
    TransactionInstruction
} from '@solana/web3.js';

import { ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';

import fs from 'mz/fs';
import path from 'path';
import * as borsh from 'borsh';

import { getRpcUrl } from './utils';

var connection: Connection;

type SphereAccount = {
    tokenAccount: PublicKey,
    minter: PublicKey;
};

export async function establishConnection(): Promise<Connection> {
    const rpcUrl = await getRpcUrl();
    connection = new Connection(rpcUrl, 'confirmed');
    const version = await connection.getVersion();
    console.log('Connection to cluster established:', rpcUrl, version);
    return connection;
}

export async function createAndMintNFT(minter: Keypair) {
    let tokenAccount = new Keypair();

    let instructions = await createTokenMintInstructions(
        minter.publicKey,
        tokenAccount.publicKey,
        0, 1, true);

    let transaction = new Transaction();

    instructions.forEach(instruction => {
        transaction.add(instruction);
    });

    await sendAndConfirmTransaction(connection, transaction, [minter, tokenAccount]);

    console.log("minted nft", tokenAccount.publicKey.toBase58());
}

async function createTokenMintInstructions(
    minter: PublicKey,
    tokenAccount: PublicKey,
    decimals: number,
    amount: number,
    disableMinting: Boolean
): Promise<TransactionInstruction[]> {

    let instructions: TransactionInstruction[] = [];
    let rentExemptMintBalance = await Token.getMinBalanceRentForExemptMint(connection);

    // Create on chain account to store the new token
    instructions.push(
        SystemProgram.createAccount({
            fromPubkey: minter,
            newAccountPubkey: tokenAccount,
            lamports: rentExemptMintBalance,
            space: MintLayout.span,
            programId: TOKEN_PROGRAM_ID,
        })
    );

    // Create the new tokenAccount
    instructions.push(
        Token.createInitMintInstruction(
            TOKEN_PROGRAM_ID,
            tokenAccount,
            decimals,
            minter,
            null,
        )
    );

    // Calculate the address of the on chain account for the minter (to hold the amount of the token)
    const associatedAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        tokenAccount,
        minter
    );

    // Create the on chain account for the minter
    instructions.push(
        Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            tokenAccount,
            associatedAccount,
            minter,
            minter,
        )
    );

    // Execute the mint into the on chain account of the minter
    instructions.push(
        Token.createMintToInstruction(
            TOKEN_PROGRAM_ID,
            tokenAccount,
            associatedAccount,
            minter,
            [],
            amount
        )
    );

    if (disableMinting) {
        // Disable any future minting of the token
        instructions.push(
            Token.createSetAuthorityInstruction(
                TOKEN_PROGRAM_ID,
                tokenAccount,
                null,
                'MintTokens',
                minter,
                []
            )
        );
    }

    return instructions;
} 
