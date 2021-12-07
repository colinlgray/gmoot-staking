import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { WalletConnectionProvider } from "./providers/WalletConnectionProvider";
import { Router } from "./containers";
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
            <Router />
          </WalletModalProvider>
        </WalletConnectionProvider>
      </SnackbarProvider>
    </div>
  );
}

export default App;
