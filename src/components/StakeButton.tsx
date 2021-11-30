import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { FC, useCallback, useState } from "react";
import { Spinner } from "./index";
import { RowProps } from "../containers/NFTRow";
import { useNotify, useProgram } from "../hooks";
import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { web3 } from "@project-serum/anchor";
import { Signer } from "@solana/web3.js";

export const StakeButton: FC<RowProps> = (props) => {
  const notify = useNotify();

  const [loading, setLoading] = useState(false);
  const program = useProgram();
  const wallet = useWallet();
  const aWallet = useAnchorWallet();

  // check has stake account
  console.log("stake account data", props.stakeAccount?.data);
  const onClick = useCallback(async () => {
    // If there isn't a program it's because the wallet is undefined
    if (
      !program ||
      wallet === null ||
      wallet.publicKey === null ||
      !props.rewarder
    )
      throw new WalletNotConnectedError();
    try {
      if (loading === true) return;
      setLoading(true);
      if (props.stakeAccount === undefined) {
        throw new Error("still loading stake account, please wait");
      } else if (props.stakeAccount?.data === null) {
        // create stake account
        // this doesn't work but is kinda close
        const initArgs = {
          accounts: {
            owner: wallet.publicKey.toBase58(),
            stakeAccount: props.stakeAccount.address.toBase58(),
            rewarder: props.rewarder.address.toBase58(),
            systemProgram: web3.SystemProgram.programId.toBase58(),
            rent: wallet.publicKey.toBase58(),
          },
          // signers: [aWallet as Signer],
        };

        program.rpc
          .initializeStakeAccount(props.stakeAccount.bump, initArgs)
          .then((res) => {
            console.log("SUCCESS!", res);
            notify("success", "SUCCESS!!!");
          })
          .catch((e) => {
            console.log("failed", e);
            notify("error", `error: ${e?.message}`);
          });
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
