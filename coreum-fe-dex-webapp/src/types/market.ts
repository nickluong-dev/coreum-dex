export type Market = {
  base: MarketSide;
  counter: MarketSide;
  ripple_symbol?: string;
  reversed_symbol?: string;
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


