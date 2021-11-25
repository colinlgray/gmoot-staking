import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useCallback } from "react";
import { useNotify } from "../components/Notify";
import { SendLamportButton } from "../components/SendLamportButton";

export function StakingInterface() {
  return (
    <div>
      <div className="text-lg py-4">Your gmoots:</div>
      <SendLamportButton />
    </div>
  );
}
