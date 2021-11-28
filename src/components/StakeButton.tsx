import { programs } from "@metaplex/js";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { /* useConnection,*/ useWallet } from "@solana/wallet-adapter-react";
import { FC, useCallback, useState } from "react";
import { Spinner } from "./index";
import { useNotify } from "../hooks/useNotify";

interface Props {
  nft: programs.metadata.Metadata;
}

export const StakeButton: FC<Props> = (props) => {
  //   const { connection } = useConnection();
  const wallet = useWallet();
  const notify = useNotify();

  const [loading, setLoading] = useState(false);

  const onClick = useCallback(async () => {
    if (!wallet || !wallet.publicKey) throw new WalletNotConnectedError();
    try {
      if (loading === true) return;
      setLoading(true);
      console.log("Would do something here");
      setLoading(false);
    } catch (e: any) {
      console.log("Error with transaction", e);
      notify("error", `Transaction failed! ${e?.message}`);
      setLoading(false);
      return;
    }
  }, [wallet, notify, loading]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <button
      onClick={onClick}
      className="bg-green-500 hover:bg-green-700 font-bold py-1 px-2 rounded"
    >
      Stake
    </button>
  );
};
