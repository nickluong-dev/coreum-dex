import { useState, useEffect, useRef } from "react";
import BigNumber from "bignumber.js";
import { useStore } from "@/state";
import { TooltipPosition, useTooltip } from "@/hooks";
import { toFixedDown, minus } from "@/utils";
import { FormatNumber } from "../FormatNumber";
import "./Orderbook.scss";
import { OrderType, OrderbookAction } from "@/types/market";

enum ORDERBOOK_TYPE {
  ASK = "ask",
  BID = "bid",
  BOTH = "both",
}

const PRECISION_OPTIONS = [
  { key: "0.0000000001" },
  { key: "0.00000001" },
  { key: "0.0000001" },
  { key: "0.000001" },
  { key: "0.00001" },
  { key: "0.0001" },
  { key: "0.001" },
  { key: "0.01" },
  { key: "0.1" },
];

import { orderbook } from "@/mock/orderbook";
// const orderbook = null;

export default function Orderbook({
  setOrderbookAction,
}: {
  setOrderbookAction: (action: OrderbookAction) => void;
}) {
  const [asksData, setAsks] = useState<number[][]>([]);
  const [bidsData, setBids] = useState<number[][]>([]);
  const [spread, setSpread] = useState<BigNumber | string | undefined>(
    new BigNumber(0)
  );
  const [topAskVolume, setTopAskVolume] = useState<number>(0);
  const [topBidVolume, setTopBidVolume] = useState<number>(0);

  // tooltip state
  const [totalVolume, setTotal] = useState<number>(0);
  // const { theme, client, address } = useUIStore();
  const { setOrderbook, market } = useStore();
  const { showTooltip, hideTooltip } = useTooltip();

  const [leftPos, setLeftPos] = useState<number>(0);
  const [orderbookType, setOrderbookType] = useState<ORDERBOOK_TYPE>(
    ORDERBOOK_TYPE.BOTH
  );
  const [selectedPrecision, setSelectedPrecision] = useState<{
    [key: string]: string;
  }>(PRECISION_OPTIONS[5]);
  const [precision, setPrecision] = useState<string>(PRECISION_OPTIONS[0].key);
  const componentRef = useRef<HTMLDivElement>(null);

  // subscription
  // useEffect(() => {
  //   // const debounceSetOrderbook = debounce(() => {
  //   //   setOrderbook(address?.address);
  //   // }, 500);

  //   // debounceSetOrderbook();

  //   setOrderbook(address?.address);

  //   return () => {
  //     void client?.request({
  //       command: "unsubscribe",
  //       books: [
  //         {
  //           taker_gets:
  //             market.base.currency === "XRP"
  //               ? { currency: "XRP" }
  //               : {
  //                   currency: market.base.currency,
  //                   issuer: market.base.issuer ?? "",
  //                 },
  //           taker_pays:
  //             market.counter.currency === "XRP"
  //               ? { currency: "XRP" }
  //               : {
  //                   currency: market.counter.currency,
  //                   issuer: market.counter.issuer ?? "",
  //                 },
  //         },
  //       ],
  //     });
  //   };
  // }, [market, client, address]);

  // set asks, bids, and spread
  useEffect(() => {
    if (orderbook) {
      //deep copy the orderbook data
      const orderbookData = JSON.parse(JSON.stringify(orderbook)) as any;
      const { asks, bids } = orderbookData;

      // handle precision change, groups asks and bids by price
      const count = precision.toString().split(".")[1]?.length || 0;
      const mergedAsks = asks.reduce(
        (result: Record<string, number[]>, ask) => {
          const a = truncateNumber(ask[0], count + 1);
          const roundedA = roundUp(a, count);
          const key = roundedA.toFixed(count);
          if (result[key]) {
            result[key][1] = new BigNumber(result[key][1])
              .plus(ask[1])
              .toNumber();
            result[key][2] = new BigNumber(result[key][2])
              .plus(ask[2])
              .toNumber();
          } else {
            result[key] = [roundedA, ask[1], ask[2]];
          }
          return result;
        },
        {}
      );

      const mergedBids = bids.reduce(
        (result: Record<string, number[]>, bid) => {
          const b = truncateNumber(bid[0], count + 1);
          const roundedB = roundUp(b, count);

          const key = roundedB.toFixed(count);
          if (result[key]) {
            result[key][1] = new BigNumber(result[key][1])
              .plus(bid[1])
              .toNumber();
            result[key][2] = new BigNumber(result[key][2])
              .plus(bid[2])
              .toNumber();
          } else {
            result[key] = [roundedB, bid[1], bid[2]];
          }
          return result;
        },
        {}
      );

      const mergedAsksArray = Object.values(mergedAsks);
      const mergedBidsArray = Object.values(mergedBids);
      setAsks(mergedAsksArray);
      setBids(mergedBidsArray);

      // calculates spread based on best ask and bid
      const bestAsk = mergedAsksArray.length > 0 ? mergedAsksArray[0][0] : 0;
      const bestBid = mergedBidsArray.length > 0 ? mergedBidsArray[0][0] : 0;

      let spread;
      if (!bestAsk && !bestBid) {
        setSpread("0");
      }
      if (bestAsk && bestBid) {
        spread = new BigNumber(
          minus(bestAsk, bestBid).toNumber() > 0 ? minus(bestAsk, bestBid) : 0
        );
        setSpread(spread?.toFixed());
      } else if (bestAsk) {
        setSpread(BigNumber(bestAsk).toFixed());
      } else if (bestBid) {
        setSpread(BigNumber(bestBid).toFixed());
      }
    }
  }, [orderbook, market, precision]);

  // scroll asks to bottom
  useEffect(() => {
    const asksOb = document.getElementById("asks_ob");
    if (asksOb === null) {
      const timer = setInterval(function () {
        const asksObook = document.getElementById("asks_ob");

        if (asksObook) {
          clearInterval(timer);
        }
      }, 200);
    } else {
      asksOb.scrollTop = asksOb.scrollHeight;
    }
  }, [asksData]);

  // Find the highest volume in the orderbook
  useEffect(() => {
    if (asksData.length > 0) {
      const highestAskVolume = Math.max(...asksData.map((ask) => ask[1]));
      setTopAskVolume(highestAskVolume);
    }
    if (bidsData.length > 0) {
      const highestBidVolume = Math.max(...bidsData.map((bid) => bid[1]));
      setTopBidVolume(highestBidVolume);
    }
  }, [asksData, bidsData]);

  // // timer for ripple loading msg
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (!orderbook) {
  //       setRippleLoading(true);
  //     }
  //   }, 5000);

  //   return () => {
  //     clearTimeout(timer);
  //   };
  // }, [orderbook]);

  const toggleTooltip = (
    e: React.MouseEvent<HTMLDivElement>,
    open: boolean,
    index: number,
    orderType: ORDERBOOK_TYPE
  ) => {
    const lines = orderType === ORDERBOOK_TYPE.ASK ? asksData : bidsData;
    let tooltipTotalVolume = 0;
    let price = 0;
    let groupLength = 0;
    let avgPrice = 0;
    const lineGroup = [];
    let sum = 0;
    if (open) {
      for (let i = index; i >= 0; i--) {
        if (lines[i]) {
          groupLength++;
          lineGroup.push(lines[i]);
          avgPrice += Number(lines[i][0]);
          tooltipTotalVolume += Number(lines[i][1]);
          sum += Number(lines[i][1]) * Number(lines[i][0]);
        }
      }
      price = avgPrice / Number(groupLength);
      setTotal(tooltipTotalVolume);
      lineGroup.forEach((g) => {
        document.body
          .querySelector(`.orderbook-row[data-value="${g[0]}_${orderType}"]`)!
          .classList.add(
            orderType === ORDERBOOK_TYPE.ASK ? "hovered-ask" : "hovered-bid"
          );
      });
      showTooltip(
        e.currentTarget,
        `<div class="orderbook-tooltip">
          <div class="inline-item">
          <p class="inline-item-label">Avg. Price:</p> ~ ${toFixedDown(
            price,
            6
          )}</div>
          <div class="inline-item">
          <p class="inline-item-label">Sum ${
            counter?.symbol
          }:</p> ${toFixedDown(sum, 6)}</div>
          <div class="inline-item">
          <p class="inline-item-label">Sum ${base?.symbol}:</p> ${toFixedDown(
          totalVolume,
          6
        )}</div>
        </div>`,
        leftPos >= 245 ? TooltipPosition.LEFT : TooltipPosition.RIGHT,
        "204px"
      );
    } else {
      const orders = document.getElementsByClassName(`orderbook-row`);
      for (let i = 0; i < orders.length; i++) {
        orders[i].classList.remove("hovered-ask");
        orders[i].classList.remove("hovered-bid");
      }
    }
  };

  const truncateNumber = (value: number, dec: number) => {
    const pow = Math.pow(10, dec);
    return Math.floor(value * pow) / pow;
  };

  const roundUp = (value: number, dec: number) => {
    const pow = Math.pow(10, dec);
    return Math.ceil(value * pow) / pow;
  };

  // const counter = findToken({
  //   currency: market.counter.currency,
  //   issuer: market.counter.issuer,
  // });
  // const base = findToken({
  //   currency: market.base.currency,
  //   issuer: market.base.issuer,
  // });

  const counter = { symbol: "counter" };
  const base = { symbol: "base" };

  return (
    <div className="orderbook-container" ref={componentRef}>
      <div className="orderbook-body">
        <div className="orderbook-header ">
          <div className="title">Orderbook</div>
        </div>
        {orderbook ? (
          <>
            <div className="orderbook-header-wrapper">
              <div className="orderbook-header-cell">Price</div>
              <div className="orderbook-header-cell">Volume</div>
              <div className="orderbook-header-cell">Total</div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflowY: "hidden",
              }}
            >
              {orderbookType === ORDERBOOK_TYPE.ASK ||
              orderbookType === ORDERBOOK_TYPE.BOTH ? (
                <div
                  className="orderbook-wrapper"
                  style={{
                    flexDirection: "column-reverse",
                  }}
                  id="asks_ob"
                  onMouseLeave={() => {
                    hideTooltip();
                  }}
                >
                  {asksData.map((ask, i) => {
                    const volBar =
                      (ask[1] * 100) / topAskVolume > 3
                        ? (ask[1] * 100) / topAskVolume
                        : 2;
                    return (
                      <div
                        key={i}
                        className={"orderbook-row"}
                        data-value={ask[0].toString() + "_ask"}
                        onMouseOver={(e: React.MouseEvent<HTMLDivElement>) => {
                          toggleTooltip(e, true, i, ORDERBOOK_TYPE.ASK);
                        }}
                        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                          toggleTooltip(e, false, i, ORDERBOOK_TYPE.ASK);
                        }}
                        onClick={() =>
                          setOrderbookAction({
                            type: OrderType.BUY,
                            price: ask[0],
                            volume: totalVolume,
                          })
                        }
                      >
                        <div
                          style={{
                            width: `${volBar}%`,
                            ["left"]: 0,
                          }}
                          className="volume-bar asks"
                        />
                        <div className="orderbook-numbers-wrapper">
                          <FormatNumber
                            number={ask[0]}
                            precision={7}
                            className="orderbook-number price-asks"
                          />
                          <FormatNumber
                            number={ask[1]}
                            precision={7}
                            className="orderbook-number"
                          />
                          <FormatNumber
                            number={ask[2]}
                            precision={7}
                            className="orderbook-number"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {spread && (
                <div className="orderbook-spread">
                  <p className="spread-label">{`${counter?.symbol} Spread:`}</p>
                  <FormatNumber number={spread?.valueOf()} />
                </div>
              )}

              {orderbookType === ORDERBOOK_TYPE.BID ||
              orderbookType === ORDERBOOK_TYPE.BOTH ? (
                <div
                  className="orderbook-wrapper"
                  id="bids_ob"
                  onMouseLeave={() => {
                    hideTooltip();
                  }}
                >
                  {bidsData.map((bid, i) => {
                    const volBar =
                      (bid[1] * 100) / topBidVolume > 3
                        ? (bid[1] * 100) / topBidVolume
                        : 2;

                    return (
                      <div
                        key={i}
                        className="orderbook-row"
                        data-value={bid[0].toString() + "_bid"}
                        onMouseOver={(e) => {
                          toggleTooltip(e, true, i, ORDERBOOK_TYPE.BID);
                        }}
                        onMouseLeave={(e) => {
                          toggleTooltip(e, false, i, ORDERBOOK_TYPE.BID);
                        }}
                        onClick={() =>
                          setOrderbookAction({
                            type: OrderType.SELL,
                            price: bid[0],
                            volume: totalVolume,
                          })
                        }
                      >
                        <div
                          style={{
                            width: `${volBar}%`,
                            left: 0,
                          }}
                          className="volume-bar bids"
                        />
                        <div className="orderbook-numbers-wrapper">
                          <FormatNumber
                            number={bid[0]}
                            precision={7}
                            className="orderbook-number price-bids"
                          />
                          <FormatNumber
                            number={bid[1]}
                            precision={7}
                            className="orderbook-number"
                          />
                          <FormatNumber
                            number={bid[2]}
                            precision={7}
                            className="orderbook-number"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <div className="no-data-container">
            <img src="/trade/images/warning.png" alt="warning" />
            <p className="no-data">No Data Found</p>
          </div>
        )}
      </div>
    </div>
  );
}
