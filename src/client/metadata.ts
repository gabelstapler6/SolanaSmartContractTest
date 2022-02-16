import {
    Keypair,
    Connection,
    PublicKey,
    LAMPORTS_PER_SOL,
    SystemProgram,
    TransactionInstruction,
    Transaction,
    sendAndConfirmTransaction,
} from '@solana/web3.js';

import { DataV2, Metadata, CreateMetadataV2 } from '@metaplex-foundation/mpl-token-metadata';

import { programs } from '@metaplex/js';

import { getPayer, getRpcUrl, createKeypairFromFile } from './utils';


let updateAuthority: Keypair;

const URI = 'https://api.jsonbin.io/b/620d78a04bf50f4b2dfedca8';
const NAME = 'test';
const SYMBOL = 'sym';
const SELLER_FEE_BASIS_POINTS = 10;

export async function createMetadataForToken(payer: Keypair, tokenAccount: PublicKey, connection: Connection) {
    updateAuthority = new Keypair();

    const metadataData = new DataV2({
        uri: URI,
        name: NAME,
        symbol: SYMBOL,
        sellerFeeBasisPoints: SELLER_FEE_BASIS_POINTS,
        creators: null,
        collection: null,
        uses: null,
    });

    const metadata = await Metadata.getPDA(tokenAccount);
    const createMetadataTransction = new CreateMetadataV2(
        { feePayer: payer.publicKey },
        {
            metadata: metadata,
            metadataData: metadataData,
            updateAuthority: updateAuthority.publicKey,
            mint: tokenAccount,
            mintAuthority: payer.publicKey
        }
    );

    await sendAndConfirmTransaction(connection, createMetadataTransction, [payer]);
}