/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import os from 'os';
import fs from 'mz/fs';
import path from 'path';
import yaml from 'yaml';

import {
  PublicKey,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';

import { TextEncoder, TextDecoder } from 'util';

/**
 * @private
 */
async function getConfig(): Promise<any> {
  // Path to Solana CLI config file
  const CONFIG_FILE_PATH = path.resolve(
    os.homedir(),
    '.config',
    'solana',
    'cli',
    'config.yml',
  );
  const configYml = await fs.readFile(CONFIG_FILE_PATH, { encoding: 'utf8' });
  return yaml.parse(configYml);
}

/**
 * Load and parse the Solana CLI config file to determine which RPC url to use
 */
export async function getRpcUrl(): Promise<string> {
  try {
    const config = await getConfig();
    if (!config.json_rpc_url) throw new Error('Missing RPC URL');
    return config.json_rpc_url;
  } catch (err) {
    console.warn(
      'Failed to read RPC url from CLI config file, falling back to localhost',
    );
    return 'http://localhost:8899';
  }
}

/**
 * Load and parse the Solana CLI config file to determine which payer to use
 */
export async function getPayer(): Promise<Keypair> {
  try {
    const config = await getConfig();
    if (!config.keypair_path) throw new Error('Missing keypair path');
    return await createKeypairFromFile(config.keypair_path);
  } catch (err) {
    console.warn(
      'Failed to create keypair from CLI config file, falling back to new random keypair',
    );
    return Keypair.generate();
  }
}

/**
 * Create a Keypair from a secret key stored in file as bytes' array
 */
export async function createKeypairFromFile(
  filePath: string,
): Promise<Keypair> {
  const secretKeyString = await fs.readFile(filePath, { encoding: 'utf8' });
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  return Keypair.fromSecretKey(secretKey);
}


export async function getAndLogSolBalance(pubkey: PublicKey, connection: Connection): Promise<number> {
  let lamports = await connection.getBalance(pubkey);
  let solBalance = lamports / LAMPORTS_PER_SOL;
  console.log(pubkey.toBase58(), "has balance of", solBalance, "SOL");
  return solBalance;
}


/**
 * Request Airdrop of 1 Sol to the specified keypair (only devnet)
 * @param keypair
 * @param connection
 */
export async function requestAirdrop(keypair: Keypair, connection: Connection) {
  var airdropSignature = await connection.requestAirdrop(
    keypair.publicKey,
    LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(airdropSignature);
}