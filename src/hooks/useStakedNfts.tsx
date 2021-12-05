import { useEffect, useState } from "react";
import { programs } from "@metaplex/js";
import { useConnection } from "@solana/wallet-adapter-react";
import { useStakeAccount } from "../hooks";

export function useStakedNfts() {
  const { connection } = useConnection();
  const stakeAccount = useStakeAccount();
  const [nftList, setNftList] = useState<any[] | undefined>();

  useEffect(() => {
    let didCancel = false;
    const request = async () => {
      if (!stakeAccount) {
        return;
      }
      programs.metadata.Metadata.findByOwnerV2(
        connection,
        stakeAccount.address
      ).then((ownedMetadata) => {
        if (!didCancel) {
          setNftList(ownedMetadata);
        }
      });
    };

    request();

    return () => {
      didCancel = true;
    };
  }, [stakeAccount, connection]);

  return nftList;
}
