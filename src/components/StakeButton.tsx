import { programs } from "@metaplex/js";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { FC, useCallback, useState } from "react";
import { Spinner } from "./index";
import { useNotify, useProgram } from "../hooks";
import { RewarderAccount } from "../hooks/useRewarder";

export interface StakeButtonProps {
  nft: programs.metadata.Metadata;
  rewarder: RewarderAccount | null;
}

export const StakeButton: FC<StakeButtonProps> = (props) => {
  const notify = useNotify();

  const [loading, setLoading] = useState(false);
  const program = useProgram();

  console.log("rewarder", props.rewarder);
  // check has stake account

  const onClick = useCallback(async () => {
    // If there isn't a program it's because the wallet is undefined
    if (!program) throw new WalletNotConnectedError();
    try {
      if (loading === true) return;
      setLoading(true);
      console.log("Would do something here", program);
      // create stake account if needed
      // create reward account if needed
      // stake nft
      setLoading(false);
    } catch (e: any) {
      console.log("Error with transaction", e);
      notify("error", `Transaction failed! ${e?.message}`);
      setLoading(false);
      return;
    }
  }, [notify, loading, program]);

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
