import { getBars } from "./utils";
import { useDex } from "@/state/market";
import {
  BarPeriodParams,
  BarSymbolInfo,
  ChartSubscription,
  DataFeedAsset,
} from "@/types";
import { POLL_INTERVAL, SUPPORTED_RESOLUTIONS } from "./utils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
declare global {
  interface Window {
    chart_int_feed: any;
  }
}

export class SologenicDataFeed {
  subscriptions: ChartSubscription[];
  asset: DataFeedAsset;
  searchSymbols: any;
  constructor(asset: DataFeedAsset) {
    this.subscriptions = [];
    this.asset = asset;
    this.searchSymbols = null;
    return this;
  }

  onReady(cb: any) {
    clearInterval(window.chart_int_feed);

    window.chart_int_feed = setInterval(
      this.onInterval.bind(this),
      POLL_INTERVAL * 1000
    );

    setTimeout(() => {
      cb({ SUPPORTED_RESOLUTIONS });
    }, 0);
  }

  onInterval() {
    const now = Math.floor(Date.now() / 1000);
    this.subscriptions.forEach((sub: ChartSubscription) => {
      this.getBars(
        sub.symbolInfo,
        sub.resolution,
        { from: now - 120, to: now },
        (ticks: any[]) => {
          // console.log("Ticks received:", ticks);
          if (ticks.length > 0) {
            sub.onRealtimeCallback(ticks[ticks.length - 1]);
          } else {
            console.warn("No new ticks received.");
          }
        },
        (e: Error) => console.error("getBars error:", e)
      );
    });
  }

  resolveSymbol(
    symbolName: string,
    onSymbolResolvedCallback: any,
    onResolveErrorCallback: any
  ) {
    setTimeout(() => {
      const currentTicker = useDex.getState().currentTickerBase;
      if (currentTicker && currentTicker.last_price) {
        const zeros = () => {
          let string = "";
          const decimalLength = String(currentTicker.last_price).includes(".")
            ? String(currentTicker.last_price).split(".")[1].length
            : 10;

          const len = decimalLength < 15 ? decimalLength : 15;

          for (let i = 0; i < len; i++) string += "0";

          return string;
        };

        const symbol_stub: BarSymbolInfo = {
          ...this.asset,
          exchange: "SOLODEX",
          session: "24x7",
          // timezone: dayjs.tz.guess(),
          timezone: dayjs.tz.guess(),
          has_intraday: true,
          has_weekly_and_monthly: true,
          supported_resolutions: SUPPORTED_RESOLUTIONS,
          pricescale:
            currentTicker && Number(currentTicker.last_price) < 0.000001
              ? Number(`1${zeros()}`)
              : 1000000,
          // pricescale: 100_000_000_000_000,
          minmov: 1,
        };

        setTimeout(() => {
          onSymbolResolvedCallback(symbol_stub);
        }, 0);
      } else {
        onResolveErrorCallback(`Could not resolve symbol ${symbolName}`);
      }
    }, 1500);
  }

  getBars(
    symbolInfo: BarSymbolInfo,
    resolution: string,
    periodParams: BarPeriodParams,
    onHistoryCallback: any,
    onErrorCallback: any
  ) {
    // let to = periodParams.to;
    if (periodParams.firstDataRequest) periodParams.to = Date.now() / 1000;

    getBars(symbolInfo.id, resolution, periodParams.from, periodParams.to)
      .then((bars) => {
        if (bars.length) onHistoryCallback(bars, { noData: false });
        else onHistoryCallback(bars, { noData: true });
      })
      .catch((err) => {
        onErrorCallback(err);
        console.log(err);
      });
  }

  subscribeBars(
    symbolInfo: BarSymbolInfo,
    resolution: string,
    onRealtimeCallback: any,
    key: string
  ) {
    // Remove existing subscription with the same key
    this.unsubscribeBars(key);

    // Add new subscription
    this.subscriptions.push({
      key: `${key}`,
      symbolInfo,
      resolution,
      onRealtimeCallback,
    });
  }

  unsubscribeBars(key: string) {
    this.subscriptions = this.subscriptions.filter((s) => s.key !== key);
  }
}
