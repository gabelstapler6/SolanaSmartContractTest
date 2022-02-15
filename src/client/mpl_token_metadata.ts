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

import { DataV2 } from '@metaplex-foundation/mpl-token-metadata';

import { programs, MetadataJson, MetadataJsonProperties, MetaDataJsonCategory } from '@metaplex/js';

import { getPayer, getRpcUrl, createKeypairFromFile } from './utils';



let connection: Connection;

let programId: PublicKey;

const Metadata = programs.metadata;

const URI = 'uri';
const NAME = 'test';
const SYMBOL = 'sym';
const SELLER_FEE_BASIS_POINTS = 10;

export function test() {
    let data = new DataV2();

    new Metadata.CreateMetadataV2Args({ data: new DataV2(), isMutable: true });
    let metadata: MetadataJson = {
        name: "Sphere",
        symbol: "SPH",
        description: "",
        seller_fee_basis_points: 1000, // 10%
        image: "https://gateway.pinata.cloud/ipfs/Qmd4N15yacXhHovxwaxz6up4B4477vbBU9JoGKJnYhCFpq",
        properties: {
            files: [],
            category: 'image',
            creators: []
        }
    };

    console.log(metadata);
}