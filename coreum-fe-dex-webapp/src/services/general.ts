import { CreateOrderObject } from "@/types/market";
import { APIMethod, request } from "@/utils/api";

//TODO implement these api requests
export const getOHLC = async (
  symbol: string,
  period: string,
  from: string,
  to: string
) => {
  try {
    const data = request(
      {},
      `api/ohlc?symbol=${symbol}&period=${period}&from=${from}&to=${to}`,
      APIMethod.GET
    );
    if (data) {
      return data;
    }
  } catch (e) {
    console.log("ERROR GETTING OHLC DATA >>", e);
  }
};

export const getTrades = async (
  symbol: string,
  from: string,
  to: string,
  account: string
) => {
  try {
    const data = await request(
      {},
      `api/trades?symbol=${symbol}&account=${account}&from=${from}&to=${to}`,
      APIMethod.GET
    );
    if (data) {
      return data;
    }
  } catch (e) {
    console.log("ERROR GETTING TRADES DATA >>", e);
  }
};

export const getTickers = async (symbols: string) => {
  try {
    const data = await request(
      {},
      `api/ticker/?symbols=${symbols}`,
      APIMethod.GET
    );
    if (data) {
      return data;
    }
  } catch (e) {
    console.log("ERROR GETTING TICKERS DATA >>", e);
  }
};

export const getCurrencies = async () => {
  try {
    const data = await request({}, `api/currencies`, APIMethod.GET);
    if (data) {
      return data;
    }
  } catch (e) {
    console.log("ERROR GETTING CURRENCIES DATA >>", e);
  }
};

export const createOrder = async (order: CreateOrderObject) => {
  try {
    // require auth?
    const data = request(order, `api/order`, APIMethod.POST);
    if (data) {
      return data;
    }
  } catch (e) {
    console.log("ERROR CREATING ORDER >>", e);
  }
};

// const orderSubmit = async (order: CreateOrderObject) => {
//   try {
//     const data = request(order, `api/order/submit`, APIMethod.POST);
//     if (data) {
//       return data;
//     }
//   } catch (e) {
//     console.log("ERROR SUBMITTING ORDER >>", e);
//   }
// }

export const getOrderbook = async (symbol: string) => {
  try {
    const data = request({}, `api/orderbook?symbol=${symbol}`, APIMethod.GET);
    if (data) {
      return data;
    }
  } catch (e) {
    console.log("ERROR GETTING ORDERBOOK DATA >>", e);
  }
};

export const getWalletAssets = async (address: string) => {
  try {
    const data = await request(
      {},
      `api/wallet/assets?address=${address}`,
      APIMethod.GET
    );
    if (data) {
      return data;
    }
  } catch (e) {
    console.log("ERROR GETTING WALLET ASSETS DATA >>", e);
  }
};

// export const fetchChartFeedBars = async (params: ChartFeedBarsParams) => {
//   try {
//     const data = await request(
//       { ...params },
//       "ohlc",
//       APIMethod.GET,
//       Services.SOLO_API2
//     );

//     if (data?.status === 200) {
//       return data.data;
//     }
//   } catch (e) {
//     console.log("ERROR FETCHING CHART FEED BARS ->", e);
//   }
// };
