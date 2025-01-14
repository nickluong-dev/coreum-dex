import { useEffect, useLayoutEffect, useState } from "react";
// import { Box, LinearProgress, Option, Select, Typography } from "@mui/joy/";
import {
  WalletType,
  getAvailableWallets,
  useSuggestChainAndConnect,
  getOfflineSigners,
  useAccount,
  useDisconnect,
} from "graz";
import { coreumtestnet, coreum as coreummainnet } from "graz/chains";
import { useStore } from "@/state";
import { CoreumNetwork } from "coreum-js/dist/main/types";
import { useNavigate } from "react-router-dom";
// import PushNotification from "@/components/PushNotification";
import { SUPPORTED_WALLETS } from "@/utils";
import "./LoginSelection.scss";
import { quantum } from "ldrs";
quantum.register();

const LoginSelection = ({
  closeModal,
}: {
  closeModal?: (arg: boolean) => void;
}) => {
  const navigate = useNavigate();
  const { suggestAndConnectAsync } = useSuggestChainAndConnect();
  const wallets = getAvailableWallets();
  const { data: account, isConnected } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const {
    coreum,
    verifyAuthSignTx,
    verifiedAuth,
    network,
    setWallet,
    wallet,
    setUserData,
    userData,
    setNetwork,
  } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  
  // const [openNotification, setOpenNotification] = useState(false);
  // const [notificationMessage, setNotificationMessage] = useState("");

  // useEffect(() => {
  //   if (isConnected)
  //     setWallet({ address: account?.bech32Address, name: account?.name });
  // }, [isConnected]);

  useEffect(() => {
    if (verifiedAuth && userData) {
      console.log("isConnected");

      setTimeout(() => {
        setIsLoading(false);
        navigate("/accounts");
      }, 2000);
    } else {
      setIsLoading(false);
    }
  }, [verifiedAuth, userData]);

  const initSigner = async (chainId: string, walletType: any) => {
    const signer = await getOfflineSigners({ walletType, chainId });
    await coreum?.addCustomSigner(signer.offlineSignerAuto as any);
  };

  const handleDisconnect = async () => {
    await disconnectAsync()
      .then(() => {
        console.log("disconnected");
        setWallet({ address: "", name: "" });
      })
      .catch((e) => {
        console.log("E_DISCONNECT =>", e);
      });
  };

  const connectWithGraz = async (option: WalletType) => {
    try {
      setIsLoading(true);
      const chain =
        network === CoreumNetwork.MAINNET ? coreummainnet : coreumtestnet;
      console.log("Attempting to connect with:", option, chain.chainId);
      await initSigner(chain.chainId, option);
      await suggestAndConnectAsync({
        chainInfo: chain,
        walletType: option,
        autoReconnect: false,
      });
      console.log("Connected with:", option);
      setWallet({ address: coreum!.address, name: account?.name });
      closeModal && closeModal(false);
    } catch (e: any) {
      console.error("Connection failed:", e);
      setIsLoading(false);
    }
  };

  const resolveOption = (option: WalletType) => {
    switch (option) {
      case "metamask_snap_leap":
        return "MetaMask";
      case "leap":
        return "Leap";
      case "keplr":
        return "Keplr";
      case "cosmostation":
        return "Cosmostation";
      default:
        return option;
    }
  };

  return isLoading ? (
    <div className="loader">
      <p className="connecting">Connecting</p>
      <l-quantum size="40" speed="6" color="white"></l-quantum>
    </div>
  ) : (
    <div className="wallet-options">
      {SUPPORTED_WALLETS.map((option, idx) => {
        return (
          <div
            className="wallet-option"
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => {
              if (wallets[option]) {
                connectWithGraz(option);
              }
            }}
            key={idx}
          >
            <img
              src={`/trade/images/${option}.svg`}
              alt={option}
              width={24}
              height={24}
            />
            <p>{resolveOption(option)}</p>
          </div>
        );
      })}
    </div>
  );
};

export default LoginSelection;
