import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useRewarder, useStakedNfts, useWalletNfts, useNotify } from "../hooks";
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
  const [unstakeCount, setUnstakeCount] = useState<number>(0);

  const walletNotConnected = !publicKey;
  const nftsUndefined = stakedNfts === undefined || walletNfts === undefined;

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
      console.log("request");
      if (!rewarder || !publicKey) {
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

      if (!didCancel) {
        if (rewarderAccount !== null) {
          const res = programs.deserialize(rewarderAccount?.data);
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
  }, [rewarder, publicKey, connection, notify, unstakeCount]);

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
          <div className="border-2 rounded p-12 mx-24 my-6">
            <ClaimInterface tokenCount={tokenCount} />
          </div>
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
