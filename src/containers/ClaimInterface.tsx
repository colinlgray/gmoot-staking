import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import {
  Token,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { programs } from "@metaplex/js";
import { useNotify, useRewarder, useProgram, useStakeAccount } from "../hooks";
import { web3 } from "@project-serum/anchor";
import { Spinner } from "../components";

export function ClaimInterface() {
  const { connection } = useConnection();
  const rewarder = useRewarder();
  const wallet = useWallet();
  const stakeAccount = useStakeAccount();
  const notify = useNotify();
  const program = useProgram();
  const [tokenCount, setTokenCount] = useState<null | number>(null);
  const [loading, setLoading] = useState(false);

  const claim = useCallback(async () => {
    try {
      if (
        !rewarder?.rewardAuthority ||
        !wallet.publicKey ||
        !stakeAccount ||
        !rewarder ||
        !program
      ) {
        throw new Error("Not finished loading");
      }
      setLoading(true);
      const tokenAccountAddress = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        rewarder.data.rewardMint,
        wallet.publicKey,
        false
      );

      const txId = await program.rpc.claim({
        accounts: {
          owner: wallet.publicKey.toBase58(),
          rewarder: rewarder.address.toBase58(),
          rewardAuthority: rewarder.rewardAuthority.toBase58(),
          stakeAccount: stakeAccount.address.toBase58(),
          rewardMint: rewarder.data.rewardMint.toBase58(),
          rewardAccount: tokenAccountAddress.toBase58(),
          tokenProgram: TOKEN_PROGRAM_ID.toBase58(),
          clock: web3.SYSVAR_CLOCK_PUBKEY.toBase58(),
        },
      });
      console.log(`Transaction Id: ${txId}`, txId);
      setLoading(false);
      notify("success", `Claiming Successful. Transaction Id: ${txId}`);
    } catch (e) {
      setLoading(false);
      notify("error", `Error: ${e}`);
    }
  }, [program, rewarder, stakeAccount, wallet.publicKey, notify]);

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
          console.log("reward account info", res.amount.toNumber());
          setTokenCount(res.amount.toNumber());
          try {
          } catch (e) {
            notify("error", `Error: ${e}`);
          }
        }
      }
    }

    requestRewarder();

    return teardown;
  }, [rewarder, wallet, connection, notify]);
  const displayValue = tokenCount ? tokenCount * 0.000000001 : null;
  return (
    <div className="flex justify-between align-center items-center">
      <div className="flex flex-col">
        <div>Your tokens: {displayValue || 0}</div>
        <div>Your pending rewards: {0}</div>
      </div>
      <div className="w-24 flex justify-center">
        {loading && <Spinner />}
        {!loading && (
          <button
            onClick={claim}
            className="bg-green-500 hover:bg-green-700 font-bold py-1 px-2 rounded"
            disabled={rewarder === null || loading}
          >
            Claim
          </button>
        )}
      </div>
    </div>
  );
}
