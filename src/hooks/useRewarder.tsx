import { useProgram } from "./useProgram";
import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useNotify } from ".";

export type Creator = {
  address: PublicKey;
  verified: boolean;
  share: number;
};

export type RewarderAccountData = {
  authority: PublicKey;
  rewardMint: PublicKey;
  rewardAuthorityBump: number;
  rewardRate: number;
  allowedUpdateAuthority: PublicKey;
  creators: Creator[];
  collection: string;
  enforceMetadata: boolean;
  totalStaked: number;
};

export type RewarderAccount = {
  address: PublicKey;
  rewardAuthority: PublicKey;
  data: RewarderAccountData;
};

const collectionName = "gmoot";

export function useRewarder() {
  const wallet = useAnchorWallet();
  const program = useProgram();
  const [account, setAccount] = useState<RewarderAccount | null | undefined>(
    undefined
  );
  const notify = useNotify();

  useEffect(() => {
    let didCancel = false;
    async function requestRewarder() {
      // TODO: Clear cache when wallet changes
      if (!wallet || !program || !!account) return;
      const rewarder = (
        await PublicKey.findProgramAddress(
          [
            Buffer.from(collectionName),
            program.programId.toBuffer(),
            Buffer.from("rewarder"),
          ],
          program.programId
        )
      )[0];
      // console.log("rewarder", rewarder.toBase58());
      const rewardAuthority = (
        await PublicKey.findProgramAddress(
          [
            Buffer.from(collectionName),
            program.programId.toBuffer(),
            Buffer.from("rewarder"),
            rewarder.toBuffer(),
          ],
          program.programId
        )
      )[0];
      try {
        const data = await program.account.nftStakeRewarder.fetchNullable(
          rewarder
        );
        if (!didCancel) {
          if (!data) {
            setAccount(null);
          } else {
            setAccount({
              address: rewarder,
              rewardAuthority,
              data: data as RewarderAccountData,
            } as RewarderAccount);
          }
        }
      } catch (e) {
        console.log("Unable to load rewarder");
        notify("error", `Error ${(e as any)?.message}`);
      }
    }

    requestRewarder();

    // Return teardown
    return () => {
      didCancel = true;
    };
  }, [program, wallet, account, notify]);
  return account;
}
