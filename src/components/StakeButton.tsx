import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { FC, useCallback, useState } from "react";
import { Spinner } from "./index";
import { RowProps } from "../containers/NFTRow";
import { useNotify, useProgram } from "../hooks";
import { useWallet } from "@solana/wallet-adapter-react";

export const StakeButton: FC<RowProps> = (props) => {
  const notify = useNotify();

  const [loading, setLoading] = useState(false);
  const program = useProgram();
  const wallet = useWallet();

  // check has stake account

  const onClick = useCallback(async () => {
    // If there isn't a program it's because the wallet is undefined
    if (!program) throw new WalletNotConnectedError();
    try {
      if (loading === true) return;
      setLoading(true);
      if (props.stakeAccount === undefined) {
        throw new Error("still loading stake account, please wait");
      } else if (props.stakeAccount?.data === null) {
        console.log("wallet", wallet);
        // create stake account
        // await program.rpc.initializeStakeAccount(props.stakeAccount.bump, {
        //   accounts: {
        //     owner: wallet.publicKey,
        //     stakeAccount: props.stakeAccount.address,
        //     rewarder: props.rewarder,
        //     systemProgram: program,
        //     rent: wallet,
        //   },
        //   signers: [wallet],
        // });
      }
      // create reward account if needed
      // stake nft
      setLoading(false);
    } catch (e: any) {
      console.log("Error with transaction", e);
      notify("error", `Transaction failed! ${e?.message}`);
      setLoading(false);
      return;
    }
  }, [notify, loading, program, wallet, props]);

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
