import { Wallet } from "./components/Wallet/Wallet";

function App() {
  return (
    <div className="app">
      <header className="flex justify-between items-center">
        <div className="font-bold text-3xl select-none p-4 px-12">gmoot</div>
        <div className="font-bold">staking</div>
        <div className="px-12">
          <Wallet />
        </div>
      </header>
      <div>
        <div className="flex justify-center"></div>
      </div>
    </div>
  );
}

export default App;
