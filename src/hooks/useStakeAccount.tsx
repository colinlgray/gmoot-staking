import { useProgram } from "./useProgram";
import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useRewarder } from "./useRewarder";
import { useNotify } from ".";
import { BN } from "@project-serum/anchor";

export type StakeAccountData = {
  owner: PublicKey;
  rewarder: PublicKey;
  numStaked: number;
  bump: number;
  lastClaimed: BN;
};

export type StakeAccount = {
  address: PublicKey;
  bump: number;
  data?: StakeAccountData | null;
};

export function useStakeAccount() {
  const wallet = useAnchorWallet();
  const program = useProgram();
  const rewarder = useRewarder();
  const [account, setAccount] = useState<StakeAccount | null>();
  const notify = useNotify();

  useEffect(() => {
    let didCancel = false;
    const request = async () => {
      if (wallet && program && rewarder) {
        const [stakeAccountPDA, stakeAccountBump] =
          await PublicKey.findProgramAddress(
            [
              Buffer.from(rewarder.data.collection),
              program.programId.toBuffer(),
              Buffer.from("stake_account"),
              rewarder.address.toBuffer(),
              wallet.publicKey.toBuffer(),
            ],
            program.programId
          );
        try {
          const data = await program.account.nftStakeAccount.fetchNullable(
            stakeAccountPDA
          );
          if (!didCancel) {
            setAccount({
              bump: stakeAccountBump,
              address: stakeAccountPDA,
              data: data as StakeAccountData,
            } as StakeAccount);
          }
        } catch (error) {
          notify("error", `Unable to load stake account: ${error}`);
          console.log("error", (error as any)?.message);
        }
      }
    };
    request();

    return () => {
      didCancel = true;
    };
  }, [program, wallet, rewarder, notify]);

  return account;
}
