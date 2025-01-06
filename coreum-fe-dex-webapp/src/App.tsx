import { RouterProvider } from "react-router-dom";
import router from "./router";
import { GrazProvider, configureGraz } from "graz";
import { coreum, coreumtestnet } from "graz/chains";
import { useStore } from "@/state";
// import "./i18n";
import { useEffect } from "react";
import { Toaster } from "./components/Toaster";

const options = configureGraz({
  chains: [coreum, coreumtestnet],
  autoReconnect: false,
});

function App() {
  const { startCoreum, network } = useStore();

  // start coreum on app load
  useEffect(() => {
    startCoreum(network);
  }, []);

  return (
    <>
      <GrazProvider grazOptions={options}>
        <Toaster />
        <RouterProvider router={router} />
      </GrazProvider>
    </>
  );
}

export default App;
