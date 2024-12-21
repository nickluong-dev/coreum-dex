import { create } from "zustand";
import { Client, CoreumNetwork, CosmWasm } from "coreum-js";
import { APIMethod, Services, request } from "@/utils/api";
import { getAppEnv } from "@/config/envs";
import { Market } from "@/types/market";

export type State = {
  fetching: boolean;
  wallet: any;
  setWallet: (wallet: any) => Promise<void>;
  userData: any;
  setUserData: (userData: any) => void;
  account: string;
  setAccount: (accountID: string) => void;
  network: CoreumNetwork;
  setNetwork: (network: CoreumNetwork) => void;
  coreum: Client | null;
  startCoreum: (network: CoreumNetwork) => Promise<void>;
  verifyAuthSignTx: () => Promise<void>;
  verifiedAuth: boolean;
  setVerifiedAuth: (verified: boolean) => void;

  // market
  market: Market | null;
  setMarket: (market: Market) => void;
  orderbook: any;
  setOrderbook: (orderbook: any) => void;
  feeEscalation: any;
  setFeeEscalation: (feeEscalation: any) => void;
  openOrders: any;
  setOpenOrders: (openOrders: any) => void;
  filledOrders: any;
  setFilledOrders: (filledOrders: any) => void;
  loginModal: boolean;
  setLoginModal: (loginModal: boolean) => void;
};

export const useStore = create<State>((set, get) => ({
  fetching: false,
  network: sessionStorage.network || CoreumNetwork.MAINNET,
  setNetwork: (network: CoreumNetwork) => {
    if (
      sessionStorage.network &&
      sessionStorage.network !== network &&
      localStorage.token
    ) {
      localStorage.removeItem("token");
    }
    sessionStorage.network = network;
    set(() => ({ network }));
  },
  wallet: null,
  setWallet: async (wallet: any) => {
    set(() => ({
      wallet,
    }));
  },
  userData: null,
  setUserData: (userData: any) => {
    set({ userData: userData });
  },
  account: "",
  setAccount: (accountID: string) => {
    set({ accountID: accountID });
  },
  coreum: null,
  startCoreum: async (network: CoreumNetwork) => {
    const client = new Client({
      network,
    });

    const connectOptions = { withWS: true };
    await client.connect(connectOptions);
    console.log(`Connected to Coreum ${network}`);

    set(() => ({
      coreum: client,
      network,
    }));
  },

  verifiedAuth: false,
  setVerifiedAuth: (verified: boolean) => {
    set({ verifiedAuth: verified });
  },
  verifyAuthSignTx: async () => {
    if (get().wallet && get().coreum) {
      try {
        const keysRes = await request(
          {},
          `/auth?wallet=${get().wallet.address}`,
          APIMethod.POST,
          Services.AUTH
        );

        if (keysRes?.status === 200) {
          const auth = getAppEnv().AUTH_ADDRESS;
          const encoder = new TextEncoder();
          const msg = CosmWasm.ExecuteContract({
            sender: get().wallet.address!,
            funds: [],
            contract: auth,
            msg: encoder.encode(
              JSON.stringify({
                save_key: {
                  key: keysRes.data.PublicKey,
                },
              })
            ),
          });

          const res = await get().coreum!.sendTx([msg]);

          if (res.code === 0) {
            const token = btoa(
              JSON.stringify({
                Wallet: get().wallet.address,
                PrivateKey: keysRes.data.PrivateKey,
              })
            );

            //login store token
            localStorage.setItem("token", token);
            setTimeout(async () => {
              await request(
                {},
                `/login?wallet=${get().wallet.address}`,
                APIMethod.GET,
                Services.AUTH,
                true
              )
                .then(() => {
                  console.log("Successfully sent create auth");
                  set({ verifiedAuth: true });
                })
                .catch((e: any) => {
                  console.log("E_CREATE_AUTH =>", e);
                });
            }, 200);
          }
        }
      } catch (error: any) {
        console.log("E_VERIFY_AUTH_SIGN_TX =>", error);
      }
    }
  },

  market: null,
  setMarket: (market: Market) => {},
  orderbook: null,
  setOrderbook: (orderbook: any) => {},
  feeEscalation: null,
  setFeeEscalation: (feeEscalation: any) => {},
  openOrders: null,
  setOpenOrders: (openOrders: any) => {},
  filledOrders: null,
  setFilledOrders: (filledOrders: any) => {},
  loginModal: false,
  setLoginModal: (loginModal: boolean) => {
    set({ loginModal: loginModal });
  },
}));
