import { programs } from "@metaplex/js";
import axios from "axios";
import { FC, useEffect, useState } from "react";
import { Spinner, StakeButton } from "../components";
import { RewarderAccount } from "../hooks/useRewarder";
import { StakeAccount } from "../hooks/useStakeAccount";

export interface RowProps {
  nft: programs.metadata.Metadata;
  rewarder?: RewarderAccount | null;
  stakeAccount?: StakeAccount | null;
  isStaked: boolean;
}

export const NFTRow: FC<RowProps> = (props) => {
  console.log("nft", props.nft.data);
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<any>({});
  useEffect(() => {
    setLoading(true);
    axios
      .get(props.nft.data.data.uri)
      .then((res) => {
        setMetadata(res?.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [props.nft, setLoading, setMetadata]);

  if (loading) {
    return (
      <div className="h-24 p-2 flex justify-between items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="h-24 pr-2 flex justify-between items-center text-xs">
      <div className="flex flex-col">
        <div>Name: {metadata?.name}</div>
        <div>Description: {metadata?.description}</div>
      </div>
      <div>
        <div className="flex items-center">
          <img alt="nft" className="h-24 p-4" src={metadata.image} />
          <StakeButton {...props} />
        </div>
      </div>
    </div>
  );
};
