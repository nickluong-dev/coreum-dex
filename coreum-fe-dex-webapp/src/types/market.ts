export type Market = {
  base: MarketSide;
  counter: MarketSide;
  pair_symbol?: string;
  reversed_pair_symbol?: string;
};
export type MarketSide = {
  currency: string;
  issuer?: string | undefined;
};

export enum OrderType {
  BUY = "buy",
  SELL = "sell",
}

export type Order = {
  direction: OrderType;
  quantity: {
    currency: string;
    value: string;
    issuer?: string;
  };
  totalPrice: {
    currency: string;
    value: string;
    issuer?: string;
  };
  fee?: string;
  passive?: boolean;
  fillOrKill?: boolean;
  immediateOrCancel?: boolean;
  expirationTime?: string;
};

export enum TradeType {
  MARKET = "market",
  LIMIT = "limit",
}
export type OrderbookAction = {
  type: OrderType;
  price: number;
  volume: number;
};

export enum TIME_POLICY {
  goodTilCancel = "Good till Cancel",
  goodTilTime = "Good till Time",
  immediateOrCancel = "Immediate or Cancel",
  fillOrKill = "Fill or Kill",
}
export enum TIME_SELECTION {
  "5M" = "5 Mins",
  "15M" = "15 Mins",
  "30M" = "30 Mins",
  "1H" = "1 Hour",
  "6H" = "6 Hours",
  "12H" = "12 Hours",
  "1D" = "1 Day",
  CUSTOM = "Custom",
}

export type IToken = {
  currency: string;
  issuer?: string;
  logo: string;
  name: string;
  symbol: string;
  balance?: number;
  limit?: string;
};

// tradingview

export type BarPeriodParams = {
  from: number;
  to: number;
  countBack?: number;
  firstDataRequest?: boolean;
};

export type DataFeedAsset = {
  id: string;
  name: string;
};

export type ChartSubscription = {
  key: string;
  symbolInfo: BarSymbolInfo;
  resolution: string;
  onRealtimeCallback?: any;
};

export type BarSymbolInfo = {
  id: string;
  name: string;
  exchange: string;
  session: string;
  timezone: string;
  has_intraday: boolean;
  has_weekly_and_monthly: boolean;
  supported_resolutions: string[];
  pricescale?: number;
  minmov: number;
  base_name?: string[];
  legs?: string[];
  full_name?: string;
  pro_name?: string;
  data_status?: string;
  ticker?: string;
};

// order history
export type FormattedOpenOrder = {
  side: string;
  price: string;
  volume: string;
  total: string;
  sequence: number;
};
export type Exchange = {
  id: string;
  txid: string;
  symbol: string;
  buyer: string;
  seller: string;
  is_seller_taker: boolean;
  amount: string;
  price: string;
  quote_amount: string;
  executed_at: string;
  time: string;
};

//order
export enum ORDER_TYPE {
  LIMIT = 1,
  MARKET = 2,
}

export enum TIME_IN_FORCE {
  GOOD_TILL_CANCELLED = 1,
  IMMEDIATE_OR_CANCELLED = 2,
  FILL_OR_KILL = 3,
}

export enum SIDE_BUY {
  BUY = 1,
  SELL = 2,
}

export type CreateOrderObject = {
  sender: string;
  type: ORDER_TYPE;
  id?: number;
  base_denom: string;
  quote_denom: string;
  price: {
    exp: number;
    num: number;
  };
  quantity: number;
  side: SIDE_BUY;
  good_til: {
    good_til_block_height: number;
    good_til_block_time: string;
  };
  timeInForce: TIME_IN_FORCE;
};
