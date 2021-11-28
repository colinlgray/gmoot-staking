import { actions, Wallet } from "@metaplex/js";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { FC, useCallback, useState } from "react";
import { useNotify } from "../hooks/useNotify";
import { Spinner } from "../components";

export const MintButton: FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const notify = useNotify();

  const [loading, setLoading] = useState(false);

  const onClick = useCallback(async () => {
    if (!wallet || !wallet.publicKey) throw new WalletNotConnectedError();
    try {
      if (loading === true) return;
      setLoading(true);

      const result = await actions.mintNFT({
        connection,
        wallet: wallet as Wallet,
        uri: "https://arweave.net/4HiXMz8u5DhkH0Mb3mnvnF4iJukqkzzhnkOLwqEIIaI",
        maxSupply: 10000,
      });

      notify("success", `Transaction successful! ${result.txId}`);
      setLoading(false);
    } catch (e: any) {
      console.log("Error with transaction", e);
      notify("error", `Transaction failed! ${e?.message}`);
      setLoading(false);
      return;
    }
  }, [wallet, connection, notify, loading]);

  if (loading) {
    return (
      <div className="flex items-center">
        <div className="pr-6">Please wait...</div>
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <div className="pr-6">Need an NFT?</div>
      <button
        className="bg-purple-500 hover:bg-purple-700 font-bold py-1 px-2 rounded"
        onClick={onClick}
        disabled={!wallet.publicKey}
      >
        Mint an NFT
      </button>
    </div>
  );
};
