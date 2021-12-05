import { useWallet } from "@solana/wallet-adapter-react";
import { Spinner } from "../components";
import { NFTRow } from "./NFTRow";
import {
  useRewarder,
  useStakeAccount,
  useStakedNfts,
  useWalletNfts,
} from "../hooks";

function ConnectWalletPrompt() {
  return <div>Please connect your wallet</div>;
}
const headerClassName = "text-xl font-bold border-b-2 mb-6 py-2";
export function StakingInterface() {
  const { publicKey } = useWallet();
  const rewarder = useRewarder();
  const stakeAccount = useStakeAccount();
  const stakedNfts = useStakedNfts();
  const walletNfts = useWalletNfts();

  if (!publicKey) {
    return <ConnectWalletPrompt />;
  }

  if (stakedNfts === undefined || walletNfts === undefined) {
    return (
      <div className="flex items-center">
        <div className="pr-6">{"Loading... < 1 min remaining"}</div>
        <Spinner />
      </div>
    );
  }

  if (stakedNfts.length === 0 && walletNfts.length === 0) {
    return (
      <div>
        It looks like you don't have any NFTs. You can purchase them on the{" "}
        <a href="https://digitaleyes.market/collections/Gmoot">
          secondary market
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className={!stakedNfts?.length ? "hidden" : ""}>
        <h2 className={headerClassName}>
          Your staked nfts: {stakedNfts?.length}
        </h2>
        {stakedNfts?.map((nft) => {
          return (
            <NFTRow
              key={nft.pubkey.toString()}
              nft={nft}
              rewarder={rewarder}
              stakeAccount={stakeAccount}
              isStaked
            />
          );
        })}
      </div>
      <div className={!walletNfts?.length ? "hidden" : ""}>
        <h2 className={headerClassName}>Your nfts: {walletNfts?.length}</h2>
        {walletNfts?.map((nft) => {
          return (
            <NFTRow
              key={nft.pubkey.toString()}
              nft={nft}
              rewarder={rewarder}
              stakeAccount={stakeAccount}
              isStaked={false}
            />
          );
        })}
      </div>
    </div>
  );
}
