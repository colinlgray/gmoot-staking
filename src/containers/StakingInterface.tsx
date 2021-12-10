import { FC } from "react";
import { NFTRow } from "./NFTRow";
import { useRewarder, useStakeAccount } from "../hooks";
import { programs } from "@metaplex/js";
import { UpdateFuncProps } from "./Router";
const headerClassName = "text-xl font-bold border-b-2 mb-6 py-2";
interface Props {
  walletNfts: programs.metadata.Metadata[];
  stakedNfts: programs.metadata.Metadata[];
  onNftUpdated: (props: UpdateFuncProps) => void;
}
export const StakingInterface: FC<Props> = ({
  stakedNfts,
  walletNfts,
  onNftUpdated,
}) => {
  const rewarder = useRewarder();
  const stakeAccount = useStakeAccount();

  if (stakedNfts.length === 0 && walletNfts.length === 0) {
    return (
      <div>
        It looks like you don't have any NFTs. You can purchase them on the
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
              onChange={(nftMoved) => {
                onNftUpdated({ previousLocation: "staked", nftMoved });
              }}
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
              onChange={(nftMoved) => {
                onNftUpdated({ previousLocation: "wallet", nftMoved });
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
