import { useProgram } from "./useProgram";
import { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { useAnchorWallet } from "@solana/wallet-adapter-react";


export type Creator = {
  address: PublicKey,
  verified: boolean,
  share: number,
};

export type RewarderAccountData = {
  authority: PublicKey,
  rewardMint: PublicKey,
  rewardAuthorityBump: number,
  rewardRate: number,
  allowedUpdateAuthority: PublicKey,
  creators: Creator[],
  collection: string,
  enforceMetadata: boolean,
  totalStaked: number,
};

export type RewarderAccount = {
  address: PublicKey,
  rewardAuthority: PublicKey,
  data: RewarderAccountData,
};

const collectionName = "gmoot";

export function useRewarder() {
  const wallet = useAnchorWallet();
  const program = useProgram();

  return useMemo(async () => {
  if (!wallet || !program) return;
    const rewarder =
      (await PublicKey.findProgramAddress(
        [
          Buffer.from(collectionName),
          program.programId.toBuffer(),
          Buffer.from("rewarder"),
        ],
        program.programId
      ))[0];
    const rewardAuthority =
      (await PublicKey.findProgramAddress(
        [
          Buffer.from(collectionName),
          program.programId.toBuffer(),
          Buffer.from("rewarder"),
          rewarder.toBuffer(),
        ],
        program.programId
      ))[0];

    const data = await program.account.gmootStakeRewarder.fetchNullable(rewarder);
    if (!data) return;

    return {
      address: rewarder,
      rewardAuthority,
      data: data as RewarderAccountData
    } as RewarderAccount;

  }, [program, wallet])

}