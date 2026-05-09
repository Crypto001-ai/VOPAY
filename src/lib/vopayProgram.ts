import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import idl from '../idl/vopay.json';

export const VOPAY_PROGRAM_ID = new PublicKey('2BqHZjo6i4qGLeqU43KFHeW7qwymY9PXc5J5iXzsrsKK');

export function getVopayProgram(connection: Connection, wallet: any) {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  return new Program(idl as any, provider);
}
