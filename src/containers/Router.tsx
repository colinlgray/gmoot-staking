import { useWallet } from "@solana/wallet-adapter-react";
import { useStakedNfts, useWalletNfts } from "../hooks";
import { StakingInterface, ClaimInterface } from "../containers";
import { Spinner } from "../components";

export function Router() {
  const stakedNfts = useStakedNfts();
  const walletNfts = useWalletNfts();
  const { publicKey } = useWallet();
  const walletNotConnected = !publicKey;
  const nftsUndefined = stakedNfts === undefined || walletNfts === undefined;
  return (
    <div>
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
            <ClaimInterface />
          </div>
          <div className="border-2 rounded p-12 mx-24 my-6">
            <StakingInterface stakedNfts={stakedNfts} walletNfts={walletNfts} />
          </div>
        </>
      )}
    </div>
  );
}
