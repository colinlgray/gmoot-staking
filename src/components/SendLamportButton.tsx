import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { FC, useCallback } from "react";
import { useNotify } from "../hooks/useNotify";

export const SendLamportButton: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const notify = useNotify();

  const onClick = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();
    try {
      // Send 1 lamport to random address
      // Example taken from docs
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: Keypair.generate().publicKey,
          lamports: 1,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      notify("info", `Transaction sent:${signature}`);

      await connection.confirmTransaction(signature, "processed");
      notify("success", `Transaction successful! ${signature}`);
    } catch (e: any) {
      console.log("Error with transaction", e);
      notify("error", `Transaction failed! ${e?.message}`);
      return;
    }
  }, [publicKey, sendTransaction, connection, notify]);

  return (
    <button
      className="bg-purple-500 hover:bg-purple-700 font-bold py-2 px-4 rounded"
      onClick={onClick}
      disabled={!publicKey}
    >
      Send 1 lamport to a random address!
    </button>
  );
};
