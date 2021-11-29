import { useProgram } from "./useProgram";
import { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useRewarder } from "./useRewarder";


export type StakeAccountData = {
  owner: PublicKey,
  rewarder: PublicKey,
  numStaked: number,
  bump: number,
  lastClaimed: number,
};

export type StakeAccount = {
  address: PublicKey,
  data: StakeAccountData,
};

export async function useStakeAccount() {
  const wallet = useAnchorWallet();
  const program = useProgram();
  const rewarder = await useRewarder();

  return useMemo(async () => {
  if (!wallet || !program || !rewarder) return;

    const stakeAccountPDA =
      (await PublicKey.findProgramAddress(
        [
          Buffer.from(rewarder.data.collection),
          program.programId.toBuffer(),
          Buffer.from("stake_account"),
          rewarder.address.toBuffer(),
          wallet.publicKey.toBuffer(),
        ],
        program.programId
      ))[0];

    const data = await program.account.gmootStakeAccount.fetchNullable(stakeAccountPDA);
    if (!data) return;

    return {
      address: stakeAccountPDA,
      data: data as StakeAccountData,
    } as StakeAccount;

  }, [program, wallet, rewarder])

}