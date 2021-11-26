import { useWallet } from "@solana/wallet-adapter-react";

function ConnectWalletPrompt() {
  return <div>Please connect your wallet</div>;
}

export function StakingInterface() {
  const { publicKey, wallet } = useWallet();
  if (!publicKey) {
    return <ConnectWalletPrompt />;
  }
  console.log("render", publicKey);
  return (
    <div>
      <div> Wallet: {wallet?.name}</div>
      <div className="text-lg py-4">Your gmoots:</div>
    </div>
  );
}
