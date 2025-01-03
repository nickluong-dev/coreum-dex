import { useEffect, useState, useRef } from "react";
import { Exchange, FormattedOpenOrder } from "@/types/market";
import { dropsToXrp } from "xrpl";
import BigNumber from "bignumber.js";
import { usePrevious } from "react-use";
// import { cancelOpenOrder } from "@/services/general";
import dayjs from "dayjs";
import { useStore } from "@/state";
import "./OrderHistory.scss";
import { FormatNumber } from "../FormatNumber";

const OrderHistory = () => {
  // const { theme, address, network, account, setWalletModal } = useUIStore();
  const {
    setFilledOrders,
    filledOrders,
    setOpenOrders,
    openOrders,
    market,
    wallet,
    network,
    // clearFilledOrders,
    // clearOpenOrders,
  } = useStore();
  const orderUrl = `https://${network}.xrpl.org/transactions/`;
  const prevMarket = usePrevious(market);
  const prevAddress = usePrevious(wallet?.address);
  const TABS = {
    OPEN_ORDERS: "OPEN_ORDERS",
    ORDER_HISTORY: "ORDER_HISTORY",
  };
  const [activeTab, setActiveTab] = useState(TABS.OPEN_ORDERS);
  const [fulfilledOrders, setFulfilledOrders] = useState<Exchange[]>([]);
  const [formattedOpenOrders, setFormattedOpenOrders] = useState<
    FormattedOpenOrder[]
  >([]);
  const [beforeId, setBeforeId] = useState<string | undefined>(undefined);
  const [cancelOrderModal, setCancelOrderModal] = useState(false);
  const [orderToCancel, setOrderToCancel] =
    useState<FormattedOpenOrder | null>();

  const orderBodyRef = useRef<HTMLDivElement>(null);

  // cleanup orders when market and account changes
  useEffect(() => {
    if (!wallet) {
      setFormattedOpenOrders([]);
      setFulfilledOrders([]);
      return;
    }

    if (prevMarket !== market || prevAddress !== wallet.address) {
      // void clearFilledOrders();
      // void clearOpenOrders();
    }
  }, [market, wallet?.address, network]);

  useEffect(() => {
    if (!wallet) return;

    let openOrdersInterval: NodeJS.Timeout | null = null;
    let filledOrdersInterval: NodeJS.Timeout | null = null;

    void setOpenOrders(wallet?.address);
    void setFilledOrders(wallet?.address);

    if (activeTab === TABS.OPEN_ORDERS) {
      if (filledOrdersInterval) clearInterval(filledOrdersInterval);
      openOrdersInterval = setInterval(() => {
        void setOpenOrders(wallet?.address);
      }, 30000);
    } else {
      if (openOrdersInterval) clearInterval(openOrdersInterval);
      filledOrdersInterval = setInterval(() => {
        void setFilledOrders(wallet?.address);
      }, 15000);
    }

    return () => {
      if (openOrdersInterval) clearInterval(openOrdersInterval);
      if (filledOrdersInterval) clearInterval(filledOrdersInterval);
    };
  }, [activeTab, wallet?.address, market]);

  // formatted filled orders, changes when filledOrders changes
  useEffect(() => {
    if (!wallet) return;
    if (filledOrders && filledOrders.count && filledOrders.count > 0) {
      let filled: Exchange[] = [];

      filledOrders.exchanges.map((order) => {
        filled = [
          ...filled,
          {
            buyer: order.buyer === wallet.address ? "buy" : "sell",
            price: order.price,
            amount: order.amount,
            quote_amount: order.quote_amount,
            time: dayjs(order.time).format("DD MMM HH:mm:ss YY"),
            txid: order.txid,
            id: order.id,
            symbol: order.symbol,
            executed_at: order.executed_at,
            seller: order.seller,
            is_seller_taker: order.is_seller_taker,
          },
        ];
      });

      setFulfilledOrders(
        filled.sort(
          (a: Exchange, b: Exchange) => +dayjs(b.time) - +dayjs(a.time)
        )
      );
    }
  }, [filledOrders, wallet?.address]);

  // formatted open orders, changes when openOrders changes
  useEffect(() => {
    if (!wallet?.address) return;
    let open: FormattedOpenOrder[] = [];
    if (openOrders) {
      openOrders.map((order) => {
        const base =
          typeof order.taker_pays === "string"
            ? {
                currency: "XRP",
                value: dropsToXrp(order.taker_pays).toString(),
              }
            : order.taker_pays;
        const counter =
          typeof order.taker_gets === "string"
            ? {
                currency: "XRP",
                value: dropsToXrp(order.taker_gets).toString(),
              }
            : (order.taker_gets as {
                currency: string;
                issuer: string;
                value: string;
              });

        const symbolLeft =
          base.currency === "XRP"
            ? "XRP"
            : base.currency +
              "+" +
              (base as { currency: string; issuer: string }).issuer;
        const symbolRight =
          counter.currency === "XRP"
            ? "XRP"
            : counter.currency +
              "+" +
              (counter as { currency: string; issuer: string }).issuer;

        const symbol = `${symbolLeft}/${symbolRight}`;

        if (
          symbol === market.ripple_symbol ||
          symbol === market.reversed_symbol
        ) {
          if (symbol === market.ripple_symbol) {
            open = [
              ...open,
              {
                side: "buy",
                price: BigNumber(counter.value)
                  .dividedBy(base.value)
                  .toString(),
                volume: base.value,
                total: counter.value,
                sequence: order.seq,
              },
            ];
          } else {
            open = [
              ...open,
              {
                side: "sell",
                price: BigNumber(base.value)
                  .dividedBy(counter.value)
                  .toString(),
                volume: counter.value,
                total: base.value,
                sequence: order.seq,
              },
            ];
          }
        }
      });
    }

    setFormattedOpenOrders(open);
  }, [openOrders]);

  // fetch more data when afterId changes
  useEffect(() => {
    if (!wallet?.address) return;
    if (activeTab === TABS.ORDER_HISTORY) {
      if (beforeId) {
        void setFilledOrders(wallet.address, beforeId);
      }
    }
  }, [beforeId]);

  const getFilledOrders = () => {
    return filledOrders;
  };

  const cancelOrder = async (order: FormattedOpenOrder) => {
    const test = await cancelOpenOrder(wallet?.address || "", order.sequence);
    test?.event.on("validated", () => {
      void setOpenOrders(wallet?.address || "");
      void setFilledOrders(wallet?.address || "");
    });
  };

  // handle scrolling
  useEffect(() => {
    if (!orderBodyRef.current) return;

    const handleScroll = () => {
      const orderBodyElement = orderBodyRef.current;
      if (!orderBodyElement) return;

      const { scrollTop, scrollHeight, clientHeight } = orderBodyElement;
      if (scrollTop + clientHeight >= scrollHeight) {
        if (activeTab === TABS.ORDER_HISTORY) {
          if (getFilledOrders().exchanges.length > 0) {
            const currentBeforeId =
              getFilledOrders().exchanges[
                getFilledOrders().exchanges.length - 1
              ].id;

            setBeforeId(currentBeforeId);
          }
        }
      }
    };
    const orderBodyRefCurrent = orderBodyRef.current;
    if (orderBodyRefCurrent) {
      orderBodyRefCurrent.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (orderBodyRefCurrent) {
        orderBodyRefCurrent.removeEventListener("scroll", handleScroll);
      }
    };
  }, [activeTab, getFilledOrders]);

  return (
    <div className="order-history-container">
      <div className="order-history-tabs">
        <div className="options">
          <div
            className={activeTab === TABS.OPEN_ORDERS ? "tab active" : "tab"}
            onClick={() => setActiveTab(TABS.OPEN_ORDERS)}
          >
            Open Orders
          </div>
          <div
            className={activeTab === TABS.ORDER_HISTORY ? "tab active" : "tab"}
            onClick={() => setActiveTab(TABS.ORDER_HISTORY)}
          >
            Order History
          </div>
        </div>
      </div>

      {!wallet?.address ? (
        <div className="no-orders">
          <img src="/trade/images/planet-graphic.svg" alt="" />
          You have no orders!
        </div>
      ) : (
        <>
          <div
            className={
              activeTab === TABS.OPEN_ORDERS
                ? `open-orders-labels`
                : `order-history-labels`
            }
          >
            <div className="order-history-label">Side</div>
            <div className="order-history-label">Price</div>
            <div className="order-history-label">Volume</div>
            <div className="order-history-label">Total</div>
            {activeTab === TABS.OPEN_ORDERS && <div></div>}
            {activeTab === TABS.ORDER_HISTORY ? (
              <div className="order-history-label date">
                {activeTab === TABS.ORDER_HISTORY ? "Date" : "Time"}
              </div>
            ) : (
              <div></div>
            )}
          </div>

          <div className="order-history-body" ref={orderBodyRef}>
            {activeTab === TABS.OPEN_ORDERS ? (
              <>
                {openOrders ? (
                  formattedOpenOrders.map(
                    (order: FormattedOpenOrder, index) => {
                      return (
                        <div key={index} className="open-row">
                          <div
                            className={order.side === "buy" ? `buy` : "sell"}
                          >
                            {order.side === "buy" ? "Buy" : "Sell"}
                          </div>
                          <FormatNumber
                            number={order.price}
                            precision={5}
                            className="price"
                          />
                          <FormatNumber
                            number={order.volume}
                            precision={4}
                            className="volume"
                          />
                          <FormatNumber
                            number={order.total}
                            precision={4}
                            className="total"
                          />
                          <div
                            className="cancel-order"
                            onClick={() => {
                              setOrderToCancel(order);
                              setCancelOrderModal(true);
                            }}
                          >
                            <img
                              alt="cancel-order"
                              src="/trade/images/delete-grey.svg"
                            />
                          </div>
                        </div>
                      );
                    }
                  )
                ) : (
                  <div className="no-orders">
                    <img src="/trade/images/planet-graphic.svg" alt="" />
                    You have no orders!
                  </div>
                )}
              </>
            ) : (
              <>
                {fulfilledOrders.length ? (
                  fulfilledOrders.map((order: Exchange, index) => {
                    return (
                      <div key={index} className="history-row">
                        <div className={order.buyer === "buy" ? `buy` : "sell"}>
                          {order.buyer === "buy" ? "Buy" : "Sell"}
                        </div>
                        <FormatNumber
                          number={order.price}
                          precision={5}
                          className="price"
                        />
                        <FormatNumber
                          number={order.amount}
                          precision={4}
                          className="volume"
                        />
                        <FormatNumber
                          number={order.quote_amount}
                          precision={4}
                          className="total"
                        />

                        <a
                          className="date"
                          target="_blank"
                          href={`${orderUrl}${order.txid}`}
                        >
                          {order.time}
                          {/* <Image
                          source="icons/open_link.svg"
                          alt="link"
                          size={14}
                        /> */}
                        </a>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-orders">
                    <img src="/trade/images/planet-graphic.svg" alt="" />
                    You have no orders!
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* <Modal
        showModal={cancelOrderModal}
        confirmAction={() => {
          cancelOrder(orderToCancel!);
          setCancelOrderModal(false);
          setOrderToCancel(null);
          setOpenOrders(address?.address || "");
        }}
        close={() => {
          setCancelOrderModal(false);
          setOrderToCancel(null);
        }}
        title={t("_cancel_order")}
        children={
          <div className="cancel-order-modal">
            <p className="cancel-order-disclaimer">
              {t("_confirm_cancel_order")}
            </p>
          </div>
        }
      /> */}
    </div>
  );
};

export default OrderHistory;
