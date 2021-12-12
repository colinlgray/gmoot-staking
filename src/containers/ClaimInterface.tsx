import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useState, FC } from "react";
import {
  Token,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useNotify, useRewarder, useProgram, useStakeAccount } from "../hooks";
import { web3 } from "@project-serum/anchor";
import { Spinner } from "../components";

interface Props {
  tokenCount: number | null;
  pendingRewards: number | null;
  onClaim: () => void;
}

export const ClaimInterface: FC<Props> = (props) => {
  const rewarder = useRewarder();
  const wallet = useWallet();
  const stakeAccount = useStakeAccount();
  const notify = useNotify();
  const program = useProgram();
  const [loading, setLoading] = useState(false);
  const onClaim = props.onClaim;

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
      onClaim();
    } catch (e) {
      setLoading(false);
      notify("error", `Error: ${e}`);
    }
  }, [program, rewarder, stakeAccount, wallet.publicKey, notify, onClaim]);
  const precisionValue = 4;
  let displayValue =
    props.tokenCount && props.tokenCount.toString().length >= precisionValue
      ? (props.tokenCount * 0.000000001).toPrecision(precisionValue)
      : null;
  let displayPendingValue =
    props.pendingRewards &&
    props.pendingRewards.toString().length >= precisionValue
      ? (props.pendingRewards * 0.000000001).toPrecision(precisionValue)
      : null;

  return (
    <div className="flex justify-between align-center items-center">
      <div className="flex flex-col">
        <div>Your tokens: {displayValue || 0}</div>
        <div>Your pending rewards: {displayPendingValue || 0}</div>
      </div>
      <div className="w-24 flex justify-center">
        {loading && <Spinner />}
        {!loading && displayPendingValue !== null && (
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
};
