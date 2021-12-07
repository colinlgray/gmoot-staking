import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import {
  Token,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { programs } from "@metaplex/js";
import { useNotify, useRewarder } from "../hooks";

export function ClaimInterface() {
  const { connection } = useConnection();
  const rewarder = useRewarder();
  const wallet = useWallet();
  const notify = useNotify();
  const [pendingRewards, setPendingRewards] = useState<null | number>(null);

  const claim = useCallback(async () => {
    console.log("claim");
  }, []);

  useEffect(() => {
    let didCancel = false;
    const teardown = () => {
      didCancel = true;
    };

    async function requestRewarder() {
      // const rewardRate = 10;
      if (!rewarder || !wallet.publicKey) {
        return teardown;
      }
      const tokenAccountAddress = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        rewarder.data.rewardMint,
        wallet.publicKey,
        false
      );
      const rewarderAccount = await connection.getAccountInfo(
        tokenAccountAddress
      );

      if (!didCancel) {
        if (rewarderAccount !== null) {
          const res = programs.deserialize(rewarderAccount?.data);
          setPendingRewards(res.amount.toNumber());
          try {
          } catch (e) {
            notify("error", `Error: ${e}`);
          }
        }
      }
    }

    requestRewarder();

    // Return teardown
    return teardown;
  }, [rewarder, wallet, connection, notify]);

  return (
    <div className="flex justify-between align-center items-center">
      <div>Your pending rewards: {pendingRewards || 0}</div>
      <div className="w-24 flex justify-center">
        <button
          onClick={claim}
          className="bg-green-500 hover:bg-green-700 font-bold py-1 px-2 rounded"
          disabled={rewarder === null}
        >
          Claim
        </button>
      </div>
    </div>
  );
}
