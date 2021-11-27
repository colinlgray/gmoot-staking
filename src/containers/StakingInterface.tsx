import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { programs } from "@metaplex/js";
import { Spinner } from "../components/Spinner";

function ConnectWalletPrompt() {
  return <div>Please connect your wallet</div>;
}

export function StakingInterface() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();

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
          console.log("ownedMetadata", ownedMetadata);
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
  const creatorKey = "8mxiQyfXpWdohutWgq652XQ5LT4AaX4Lf5c4gZsdNLfd";
  const gmoots = nftList?.filter((metadata) => {
    const creators = metadata.data.data.creators?.filter((creator) => {
      return (
        creator.address === creatorKey &&
        // This is incorrectly typed
        (creator.verified as unknown as number) === 1
      );
    });
    return creators && creators?.length > 0;
  });

  return (
    <div>
      <div className="text-lg py-4">Your gmoots: {gmoots?.length}</div>
    </div>
  );
}
