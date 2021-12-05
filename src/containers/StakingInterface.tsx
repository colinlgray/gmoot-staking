import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { programs } from "@metaplex/js";
import { Spinner, MintButton } from "../components";
import { NFTRow } from "./NFTRow";
import { useRewarder, useStakeAccount, useStakedNfts } from "../hooks";

function ConnectWalletPrompt() {
  return <div>Please connect your wallet</div>;
}

export function StakingInterface() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const rewarder = useRewarder();
  const stakeAccount = useStakeAccount();
  const stakedNfts = useStakedNfts();

  const [nftList, setNftList] = useState<programs.metadata.Metadata[] | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!publicKey || nftList !== null) return;
    try {
      setLoading(true);
      programs.metadata.Metadata.findByOwnerV2(connection, publicKey).then(
        (ownedMetadata) => {
          setLoading(false);
          setNftList(ownedMetadata);
        }
      );
    } catch (e) {
      setLoading(false);
      console.log("Failed to fetch metadata", e);
    }
  }, [connection, publicKey, setNftList, nftList]);

  if (!publicKey) {
    return <ConnectWalletPrompt />;
  }

  if (loading) {
    return (
      <div className="flex items-center">
        <div className="pr-6">{"Loading... < 1 min remaining"}</div>
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="text-lg py-4">
        <div>Your nfts: {nftList?.length}</div>
        <div>Your staked nfts: {stakedNfts?.length}</div>
      </div>
      {nftList?.length === 0 && (
        <div>
          <MintButton />
        </div>
      )}
      <div>
        {nftList?.map((nft) => {
          return (
            <NFTRow
              key={nft.pubkey.toString()}
              nft={nft}
              rewarder={rewarder}
              stakeAccount={stakeAccount}
            />
          );
        })}
      </div>
    </div>
  );
}
