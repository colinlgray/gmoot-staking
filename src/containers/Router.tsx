import { useWallet } from "@solana/wallet-adapter-react";
import { useStakedNfts, useWalletNfts } from "../hooks";
import { StakingInterface, ClaimInterface } from "../containers";
import { Spinner } from "../components";
import { programs } from "@metaplex/js";

export interface UpdateFuncProps {
  previousLocation: "wallet" | "staked";
  nftMoved: programs.metadata.Metadata;
}

export function Router() {
  const [stakedNfts, setStakedNfts] = useStakedNfts();
  const [walletNfts, setWalletNfts] = useWalletNfts();
  const { publicKey } = useWallet();
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
    } else {
      newStakedList.push(props.nftMoved);
      newWalletList = newWalletList.filter(
        (val) => val.pubkey.toBase58() !== props.nftMoved.pubkey.toBase58()
      );
    }
    setStakedNfts(newStakedList);
    setWalletNfts(newWalletList);
  };

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
