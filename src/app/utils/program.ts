import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import idl from "../../idl.json";
import { BN } from '@coral-xyz/anchor';

export function createProgram(connection: Connection, wallet: any) {
  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions()
  );
  return new Program(idl as Idl, provider);
}

export const findTaskPDA = (
  authority: PublicKey,
  content: string,
  programId: PublicKey
): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("task"),
      authority.toBuffer(),
      Buffer.from(content)
    ],
    programId
  );
}; 