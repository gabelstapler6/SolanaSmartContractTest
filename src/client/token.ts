
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

import { MintLayout, Token, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

import fs from 'mz/fs';
import path from 'path';
import * as borsh from 'borsh';

import { createKeypairFromFile, getRpcUrl } from './utils';

const SPHERE_TOKEN_PROGRAM_KEYPAIR_PATH = path.join('../../target/deploy', 'sphere_spl_token-keypair.json')
var SphereTokenProgramId: PublicKey

var connection: Connection

type SphereAccount = {
    tokenAccount: PublicKey,
    minter: PublicKey
};

export async function establishConnection(): Promise<Connection> {
    const rpcUrl = await getRpcUrl();
    connection = new Connection(rpcUrl, 'confirmed');
    const version = await connection.getVersion();
    console.log('Connection to cluster established:', rpcUrl, version);
    return connection;
}

export async function createAndMintNFT(minter: Keypair): Promise<PublicKey> {
    SphereTokenProgramId = (await createKeypairFromFile(SPHERE_TOKEN_PROGRAM_KEYPAIR_PATH)).publicKey

    let tokenAccount = new Keypair()

    let instructions = await createTokenMintInstructions(
        minter.publicKey,
        tokenAccount.publicKey,
        0, 1, false);

    let transaction = new Transaction();

    instructions.forEach(instruction => {
        transaction.add(instruction);
    });

    await sendAndConfirmTransaction(connection, transaction, [minter, tokenAccount]);

    console.log("minted nft", tokenAccount.publicKey.toBase58());
    return tokenAccount.publicKey;
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
            programId: SphereTokenProgramId,
        })
    );

    // Create the new tokenAccount
    instructions.push(
        Token.createInitMintInstruction(
            SphereTokenProgramId,
            tokenAccount,
            decimals,
            minter,
            null,
        )
    );

    // Calculate the address of the on chain account for the minter (to hold the amount of the token)
    const associatedAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        SphereTokenProgramId,
        tokenAccount,
        minter
    );

    // Create the on chain account for the minter
    instructions.push(
        Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            SphereTokenProgramId,
            tokenAccount,
            associatedAccount,
            minter,
            minter,
        )
    );

    // Execute the mint into the on chain account of the minter
    instructions.push(
        Token.createMintToInstruction(
            SphereTokenProgramId,
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
                SphereTokenProgramId,
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
