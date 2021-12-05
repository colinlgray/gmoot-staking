import { useEffect, useState } from "react";
import { programs } from "@metaplex/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

export function useWalletNfts() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [nftList, setNftList] = useState<
    programs.metadata.Metadata[] | undefined
  >();

  useEffect(() => {
    let didCancel = false;
    const request = async () => {
      if (!publicKey || nftList) {
        return;
      }
      programs.metadata.Metadata.findByOwnerV2(connection, publicKey).then(
        (ownedMetadata) => {
          if (!didCancel) {
            setNftList(ownedMetadata);
          }
        }
      );
    };

    request();

    return () => {
      didCancel = true;
    };
  }, [publicKey, nftList, connection]);

  return nftList;
}
