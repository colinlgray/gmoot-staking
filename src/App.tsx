import { WalletConnectionButton } from "./components/WalletConnectionButton";
import { StakingInterface } from "./containers/StakingInterface";
import { WalletConnectionProvider } from "./providers/WalletConnectionProvider";
import { SnackbarProvider } from "notistack";

function App() {
  return (
    <div className="app">
      <SnackbarProvider>
        <WalletConnectionProvider>
          <header className="flex justify-between items-center">
            <div className="font-bold text-3xl select-none p-4 px-12">
              gmoot
            </div>
            <div className="font-bold">staking</div>
            <div className="px-12">
              <WalletConnectionButton />
            </div>
          </header>
          <div className="border-2 rounded p-12 m-24">
            <StakingInterface />
          </div>
        </WalletConnectionProvider>
      </SnackbarProvider>
    </div>
  );
}

export default App;
