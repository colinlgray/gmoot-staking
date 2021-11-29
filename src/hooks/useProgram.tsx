import { Idl, Program, Provider } from "@project-serum/anchor";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { ConfirmOptions, PublicKey } from "@solana/web3.js";
import { useMemo } from "react";
import idl from "../idl.json";

const opts: ConfirmOptions = {
  preflightCommitment: "processed",
};
const programId = new PublicKey("D42AsUF2UbUcyBtK2Jvbym2ALfksvgeScNNtMg7KrSfj");
export function useProgram() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  return useMemo(() => {
    if (!wallet) return;
    const provider = new Provider(connection, wallet, opts);
    return new Program(idl as Idl, programId, provider);
  }, [connection, wallet]);
}
