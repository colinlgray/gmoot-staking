import { StakingInterface, ClaimInterface } from "./containers";
import { WalletConnectionProvider } from "./providers/WalletConnectionProvider";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

import { SnackbarProvider } from "notistack";

function App() {
  return (
    <div className="app">
      <SnackbarProvider>
        <WalletConnectionProvider>
          <WalletModalProvider>
            <header className="flex justify-between items-center">
              <div className="font-bold text-3xl select-none p-4 px-12">
                gmoot
              </div>
              <div className="font-bold">staking</div>
              <div className="px-12">
                <WalletMultiButton />
              </div>
            </header>
            <div className="border-2 rounded p-12 mx-24 my-6">
              <ClaimInterface />
            </div>
            <div className="border-2 rounded p-12 mx-24 my-6">
              <StakingInterface />
            </div>
          </WalletModalProvider>
        </WalletConnectionProvider>
      </SnackbarProvider>
    </div>
  );
}

export default App;
