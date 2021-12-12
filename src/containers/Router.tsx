import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  useRewarder,
  useStakedNfts,
  useWalletNfts,
  useNotify,
  useStakeAccount,
} from "../hooks";
import { StakingInterface, ClaimInterface } from "../containers";
import { Spinner } from "../components";
import { programs } from "@metaplex/js";
import {
  Token,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

export interface UpdateFuncProps {
  previousLocation: "wallet" | "staked";
  nftMoved: programs.metadata.Metadata;
}

export function Router() {
  const [stakedNfts, setStakedNfts] = useStakedNfts();
  const [walletNfts, setWalletNfts] = useWalletNfts();
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const notify = useNotify();
  const rewarder = useRewarder();
  const [tokenCount, setTokenCount] = useState<null | number>(null);
  const [pendingRewards, setPendingRewards] = useState<null | number>(null);
  const [unstakeCount, setUnstakeCount] = useState<number>(0);
  // Calculation for pending rewards is fuzzy, when justClaimed show 0 pending
  const [justClaimed, setJustClaimed] = useState<boolean>(false);

  const stakeAccount = useStakeAccount();
  const walletNotConnected = !publicKey;
  const nftsUndefined = stakedNfts === undefined || walletNfts === undefined;
  // console.log("stake account", stakeAccount?.data?.lastClaimed?.toPrecision());

  const updateNftList = (props: UpdateFuncProps) => {
    if (stakedNfts === undefined || walletNfts === undefined) {
      throw new Error("Unabled to find list");
    }
    let newStakedList = [...stakedNfts];
    let newWalletList = [...walletNfts];
    if (props.previousLocation === "staked") {
      newWalletList.push(props.nftMoved);
      newStakedList = newStakedList.filter(
        (val) => val.pubkey.toBase58() !== props.nftMoved.pubkey.toBase58()
      );
      // incremement unstake count to trigger refresh of account
      setJustClaimed(true);
      setUnstakeCount(unstakeCount + 1);
    } else {
      newStakedList.push(props.nftMoved);
      newWalletList = newWalletList.filter(
        (val) => val.pubkey.toBase58() !== props.nftMoved.pubkey.toBase58()
      );
    }
    setStakedNfts(newStakedList);
    setWalletNfts(newWalletList);
  };

  useEffect(() => {
    let didCancel = false;
    const teardown = () => {
      didCancel = true;
    };

    async function requestRewarder() {
      const slot = await connection.getSlot();
      const time = await connection.getBlockTime(slot);
      if (!rewarder || !publicKey || !stakeAccount?.data || time === null) {
        return teardown;
      }
      const tokenAccountAddress = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        rewarder.data.rewardMint,
        publicKey,
        false
      );
      const rewarderAccount = await connection.getAccountInfo(
        tokenAccountAddress
      );

      const lastClaimed = stakeAccount.data.lastClaimed.toNumber();
      const numStaked = stakeAccount.data.numStaked;
      if (!didCancel) {
        if (rewarderAccount !== null) {
          const res = programs.deserialize(rewarderAccount?.data);
          setTokenCount(res.amount.toNumber());
          try {
          } catch (e) {
            notify("error", `Error: ${e}`);
          }
        }
        if (numStaked === 0 || justClaimed) {
          setPendingRewards(0);
        } else {
          const pending =
            (time - lastClaimed) * rewarder.data.rewardRate * numStaked;
          setPendingRewards(pending);
        }
      }
    }

    requestRewarder();

    return teardown;
  }, [
    rewarder,
    publicKey,
    connection,
    notify,
    unstakeCount,
    stakeAccount,
    justClaimed,
  ]);

  const hideClaimInterface =
    stakedNfts?.length === 0 && walletNfts?.length === 0;

  return (
    <div className="max-w-4xl m-auto">
      {walletNotConnected && (
        <div className="border-2 rounded p-12 mx-24 my-6">
          Please connect your wallet
        </div>
      )}
      {publicKey && nftsUndefined && (
        <div className="border-2 rounded p-12 mx-24 my-6 flex items-center">
          <div className="pr-6">{"Loading... < 1 min remaining"}</div>
          <Spinner />
        </div>
      )}
      {publicKey && !nftsUndefined && (
        <>
          {!hideClaimInterface && (
            <div className="border-2 rounded p-12 mx-24 my-6">
              <ClaimInterface
                tokenCount={tokenCount}
                pendingRewards={pendingRewards}
                onClaim={() => {
                  setJustClaimed(true);
                  setUnstakeCount(unstakeCount + 1);
                }}
              />
            </div>
          )}
          <div className="border-2 rounded p-12 mx-24 my-6">
            <StakingInterface
              stakedNfts={stakedNfts}
              walletNfts={walletNfts}
              onNftUpdated={updateNftList}
            />
          </div>
        </>
      )}
    </div>
  );
}
