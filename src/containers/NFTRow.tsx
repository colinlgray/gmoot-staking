import { programs } from "@metaplex/js";
import axios from "axios";
import { FC, useEffect, useState } from "react";
import { Spinner, StakeButton } from "../components";

interface Props {
  nft: programs.metadata.Metadata;
}

export const NFTRow: FC<Props> = (props) => {
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
    <div className="h-24 pr-2 flex justify-between items-center">
      <div className="flex flex-col">
        <div>Name: {metadata?.name}</div>
        <div>Description: {metadata?.description}</div>
      </div>
      <div>
        <div className="flex items-center">
          <img alt="nft" className="h-24 p-4" src={metadata.image} />
          <StakeButton nft={metadata} />
        </div>
      </div>
    </div>
  );
};
