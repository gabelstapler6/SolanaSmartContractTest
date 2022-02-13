/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */


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

import fs from 'mz/fs';
import path from 'path';
import * as borsh from 'borsh';

import { programs, MetadataJson, MetadataJsonProperties, MetaDataJsonCategory } from '@metaplex/js';

import { getPayer, getRpcUrl, createKeypairFromFile } from './utils';
import { DataV2 } from '@metaplex-foundation/mpl-token-metadata';

/**
 * Connection to the network
 */
let connection: Connection;

let programId: PublicKey;

const Metadata = programs.metadata;

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