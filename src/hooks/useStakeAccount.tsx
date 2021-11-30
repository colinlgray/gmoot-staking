import { useProgram } from "./useProgram";
import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useRewarder } from "./useRewarder";

export type StakeAccountData = {
  owner: PublicKey;
  rewarder: PublicKey;
  numStaked: number;
  bump: number;
  lastClaimed: number;
};

export type StakeAccount = {
  address: PublicKey;
  data: StakeAccountData;
};

export function useStakeAccount() {
  const wallet = useAnchorWallet();
  const program = useProgram();
  const rewarder = useRewarder();
  const [account, setAccount] = useState<StakeAccount | null>();

  useEffect(() => {
    let didCancel = false;
    const request = async () => {
      if (wallet && program && rewarder) {
        const stakeAccountPDA = (
          await PublicKey.findProgramAddress(
            [
              Buffer.from(rewarder.data.collection),
              program.programId.toBuffer(),
              Buffer.from("stake_account"),
              rewarder.address.toBuffer(),
              wallet.publicKey.toBuffer(),
            ],
            program.programId
          )
        )[0];

        const data = await program.account.gmootStakeAccount.fetchNullable(
          stakeAccountPDA
        );
        if (!didCancel) {
          if (data) {
            setAccount({
              address: stakeAccountPDA,
              data: data as StakeAccountData,
            } as StakeAccount);
          } else {
            setAccount(null);
          }
        }
      }
    };

    request();

    return () => {
      didCancel = true;
    };
  }, [program, wallet, rewarder]);

  return account;
}
