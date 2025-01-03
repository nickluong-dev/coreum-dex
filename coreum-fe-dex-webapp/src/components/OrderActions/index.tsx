import "./OrderActions.scss";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import advancedFormat from "dayjs/plugin/advancedFormat";
import BigNumber from "bignumber.js";
import { useStore } from "@/state";
// import {
//   useUIStore,
//   Button,
//   ButtonVariant,
//   multiply,
//   FormatNumber,
//   noExponents,
//   Modal,
//   truncate,
// } from "fe-ui-lib";
// import { findToken, getAvgPriceFromOBbyVolume, xrpToDrops } from "@/utils";
import {
  OrderType,
  TradeType,
  OrderbookAction,
  TIME_POLICY,
  TIME_SELECTION,
  IToken,
  Order,
} from "@/types/market";
import {
  getAvgPriceFromOBbyVolume,
  multiply,
  noExponents,
  truncate,
  xrpToDrops,
} from "@/utils";
import { FormatNumber } from "../FormatNumber";
import "./OrderActions.scss";
import { Input, InputType } from "../Input";
import { useBalance, useChainInfo, useBalances } from "graz";
import { coreumtestnet, coreum as coreummainnet } from "graz/chains";
import Button, { ButtonVariant } from "../Button";

// import { useDex } from "@/state/market";
// import { IToken, Order } from "@/types/state";
// import { PairInfo } from "../PairDisplay";
// import { submitOrder } from "@/services/general";
// import MarketLimitAdvanced from "./MarketLimitAdvanced";

// buffer of 0.5% for when orders are placed
const ORDER_BUFFER = 1.005;

dayjs.extend(utc);
dayjs.extend(advancedFormat);

const OrderActions = ({
  orderbookAction,
}: // tradeType,

{
  orderbookAction?: OrderbookAction;
  // tradeType: TradeType;
  // setTradeType: (tradeType: TradeType) => void;
}) => {
  const {
    // address,
    // account,
    // theme,
    // serverInfo,
    // pushNotification,
    // setWalletModal,
  } = useStore();
  const {
    market,
    orderbook,
    feeEscalation,
    setOpenOrders,
    setFilledOrders,
    wallet,
    setLoginModal,
  } = useStore();
  const [orderType, setOrderType] = useState<OrderType>(OrderType.BUY);
  const [base, setBase] = useState<IToken>();
  const [counter, setCounter] = useState<IToken>();

  const [completed, setCompleted] = useState<boolean>(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [limitPrice, setLimitPrice] = useState("");
  const [errorVisible, setErrorVisible] = useState({
    state: false,
    msg: "",
  });
  const [volume, setVolume] = useState<string>("");
  const [percentage, setPercent] = useState<number>(0);
  const [timeInForce, setTimeInForce] = useState<TIME_POLICY>(
    TIME_POLICY.goodTilCancel
  );
  const [expirationTime, setExpirationTime] = useState<string>("");
  const [customTime, setCustomTime] = useState<string>("");
  const [timeToCancel, setTimeToCancel] = useState<TIME_SELECTION>(
    TIME_SELECTION["5M"]
  );
  const [isPassive, setIsPassive] = useState<boolean>(false);
  const [errorAmount, setErrorAmount] = useState({
    state: false,
    msg: "",
  });
  const [confirmOrderModal, setConfirmOrderModal] = useState<boolean>(false);
  const [tradeType, setTradeType] = useState(TradeType.MARKET);
  const test = useChainInfo({
    chainId: coreummainnet.chainId,
  });

  // TODO for the balances based on the selected market
  // need to find and parse the correct denom based on selected market

  // const { data: balance } = useBalance({
  //   bech32Address: "core1ne7crs92qeu0nnvckyzamqwa77qzwq5pqf323s",
  //   denom:
  //     "drop-core1zhs909jp9yktml6qqx9f0ptcq2xnhhj99cja03j3lfcsp2pgm86studdrz",
  //   chainId: coreummainnet.chainId,
  // });
  // console.log(Number(balance?.amount) / 1000000);

  // const { data: balances } = useBalances({
  //   bech32Address: "core1ne7crs92qeu0nnvckyzamqwa77qzwq5pqf323s",
  //   chainId: coreummainnet.chainId,
  //   multiChain: true,
  // });

  // console.log(test);
  // console.log(balances);

  // const [trustlines, setTrustlines] = useState<TrustLine[] | undefined>(
  //   undefined
  // );
  // const [trustlineError, setTrustlineError] = useState<boolean>(false);

  // useEffect(() => {
  //   if (account) {
  //     const base = findToken({
  //       currency: market.base.currency,
  //       issuer: market.base.issuer,
  //       withBalance: true,
  //     });
  //     const counter = findToken({
  //       currency: market.counter.currency,
  //       issuer: market.counter.issuer,
  //       withBalance: true,
  //     });

  //     if (base?.currency === "XRP") {
  //       setBase({
  //         ...base,
  //         balance: base.balance! - account.reserve,
  //       });
  //     } else setBase(base);
  //     if (counter?.currency === "XRP") {
  //       setCounter({
  //         ...counter,
  //         balance: counter.balance! - account.reserve,
  //       });
  //     } else setCounter(counter);
  //   }
  // }, [account.account_info, market]);

  // trigger when click on orderbook
  useEffect(() => {
    if (orderbookAction?.price) {
      setTradeType(TradeType.LIMIT);
      setOrderType(orderbookAction.type);
      setVolume(orderbookAction.volume.toString());
      setLimitPrice(orderbookAction.price.toString());
      setTotalPrice(
        multiply(orderbookAction.price, orderbookAction.volume).toNumber()
      );
    }
  }, [orderbookAction]);

  useEffect(() => {
    if (timeInForce === TIME_POLICY.goodTilTime) {
      let now = dayjs.utc();

      switch (timeToCancel) {
        case TIME_SELECTION["5M"]:
          now.add(5, "minutes");
          break;
        case TIME_SELECTION["15M"]:
          now.add(15, "minutes");
          break;
        case TIME_SELECTION["30M"]:
          now.add(30, "minutes");
          break;
        case TIME_SELECTION["1H"]:
          now.add(1, "hours");
          break;
        case TIME_SELECTION["6H"]:
          now.add(6, "hours");
          break;
        case TIME_SELECTION["12H"]:
          now.add(12, "hours");
          break;
        case TIME_SELECTION["1D"]:
          now.add(1, "day");
          break;
        case TIME_SELECTION.CUSTOM:
          now = dayjs.utc(customTime);
          break;
      }

      setExpirationTime(now.format());
    }
  }, [timeInForce, timeToCancel, customTime]);

  useEffect(() => {
    if (tradeType === TradeType.LIMIT) {
      const vol = volume ? Number(volume) : 0;

      const total = multiply(Number(limitPrice), vol);
      setTotalPrice(
        !total.isNaN()
          ? Number(noExponents(Number(total)).replaceAll(",", ""))
          : 0
      );
    }

    if (orderbook) {
      if (tradeType === TradeType.MARKET) {
        const avgPrice = Number(
          getAvgPriceFromOBbyVolume(
            orderType === OrderType.BUY ? orderbook.asks : orderbook.bids,
            volume
          )
        );

        const vol = volume ? Number(volume) : 0;

        // setTotalPrice(numeral(toFixedDown(avgPrice, 6)).multiply(vol).value());

        const expRegex = /[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)/g;
        const total = multiply(avgPrice, vol).toNumber();
        setTotalPrice(
          !expRegex.test(total.toString()) && !isNaN(total) ? total : 0
        );
      }
    }
  }, [volume, limitPrice, orderbook, tradeType, orderType]);

  useEffect(() => {
    if (base && counter) {
      const balance =
        orderType === OrderType.BUY ? counter.balance : base.balance;
      if (
        !totalPrice ||
        (tradeType === TradeType.LIMIT &&
          timeInForce === TIME_POLICY.goodTilTime &&
          !expirationTime &&
          dayjs(expirationTime).isAfter(dayjs()))
      ) {
        if (errorAmount.state) setErrorAmount({ state: false, msg: "" });
        if (completed) setCompleted(false);
      } else if (
        (orderType === OrderType.BUY && totalPrice > balance!) ||
        (orderType === OrderType.SELL && Number(volume) > balance!)
      ) {
        if (completed) setCompleted(false);
        if (!errorAmount.state)
          setErrorAmount({ state: true, msg: "Insufficient funds" });
      } else {
        if (errorAmount.state) setErrorAmount({ state: false, msg: "" });
        if (!completed) setCompleted(true);
      }
    } else {
      completed && setCompleted(false);
      errorAmount.state && setErrorAmount({ state: false, msg: "" });
    }
  }, [totalPrice, timeInForce, expirationTime, tradeType, orderType]);

  // // check trustlines for error msg
  // useEffect(() => {
  //   if (!trustlines) return;
  //   const hasCounterCurrency =
  //     counter?.symbol === "XRP" ||
  //     counter?.symbol === "SOLO" ||
  //     trustlines.some((line) => line.currency === counter?.currency);
  //   const hasBaseCurrency =
  //     base?.symbol === "XRP" ||
  //     base?.symbol === "SOLO" ||
  //     trustlines.some((line) => line.currency === base?.currency);
  //   setTrustlineError(!(hasCounterCurrency && hasBaseCurrency));
  // }, [orderType, market, trustlines, account.account_info.connected]);

  // const getTrustlines = async () => {
  //   const client = useUIStore.getState().client;
  //   if (client) {
  //     try {
  //       const response = (await client.request({
  //         command: "account_lines",
  //         account: account.account_info.Account || "",
  //         ledger_index: "validated",
  //       })) as any;

  //       if (response) {
  //         setTrustlines(response.result.lines);
  //       }
  //     } catch (error) {
  //       console.log("ERROR_GETTING_TRUSTLINES -> ", error);
  //     }
  //   }
  // };

  const PercentageOptions = useCallback(() => {
    return (
      <div className="percentage-options-wrapper">
        {[25, 50, 75, 100].map((per: number) => {
          return "k";
          // <Button
          //   key={per}
          //   variant={ButtonVariant.OUTLINE}
          //   onClick={() => {
          //     setPercent(per);
          //   }}
          //   content={`${per}%`}
          //   width={"100%"}
          //   height={23}
          //   fontSize={10}
          // />
        })}
      </div>
    );
  }, []);

  const handlePlaceOrder = async (
    tradeType: TradeType | null,
    orderType: OrderType | null
  ) => {
    if (!tradeType || !orderType) {
      // pushNotification({
      //   type: "error",
      //   message: "Trade type or order type is missing",
      // });
      setConfirmOrderModal(false);

      return;
    }

    if (wallet) {
      const quantityValue =
        market.base.currency === "XRP"
          ? `${new BigNumber(String(volume).split(",").join("")).valueOf()}`
          : truncate(volume);

      const totalPriceValue =
        market.counter.currency === "XRP"
          ? `${new BigNumber(String(totalPrice).split(",").join("")).valueOf()}`
          : truncate(totalPrice);

      if ([market.base.currency, market.counter.currency].includes("XRP")) {
        const maxDrops = 100000000000000000;
        const minDrops = 1;

        if (
          (market.base.currency === "XRP" &&
            Number(xrpToDrops(quantityValue)) > maxDrops) ||
          (market.counter.currency === "XRP" &&
            Number(xrpToDrops(totalPriceValue)) > maxDrops)
        ) {
          if (!errorVisible.state)
            setErrorVisible({
              msg: "Amount is too large",
              state: true,
            });
        }

        if (
          (market.base.currency === "XRP" &&
            Number(xrpToDrops(quantityValue)) < minDrops) ||
          (market.counter.currency === "XRP" &&
            Number(xrpToDrops(totalPriceValue)) < minDrops)
        ) {
          if (!errorVisible.state)
            setErrorVisible({
              msg: "Amount is too small",
              state: true,
            });
        }
      }

      const accountAddress = wallet.address;

      const order: Order = {
        direction: orderType,
        quantity: {
          currency: market.base.currency,
          value: quantityValue,
        },
        totalPrice: {
          currency: market.counter.currency,
          value:
            orderType === OrderType.BUY
              ? BigNumber(totalPriceValue).multipliedBy(ORDER_BUFFER).toString()
              : totalPriceValue,
        },
        ...(tradeType === TradeType.LIMIT
          ? {
              limitPrice: {
                value: new BigNumber(
                  String(limitPrice).split(",").join("")
                ).valueOf(),
                currency: market.counter.currency,
              },
            }
          : {}),
        ...(feeEscalation?.recommend && {
          fee: `${feeEscalation.suggestion.drops}`,
        }),
      };

      if (tradeType === TradeType.MARKET) {
        order.immediateOrCancel = true;
      } else {
        if (isPassive) order.passive = true;
        if (timeInForce === TIME_POLICY.fillOrKill) order.fillOrKill = true;
        if (timeInForce === TIME_POLICY.immediateOrCancel)
          order.immediateOrCancel = true;
        if (timeInForce === TIME_POLICY.goodTilTime)
          order.expirationTime = dayjs.utc(expirationTime).toISOString();
      }

      // Check if base is XRP, if not, add counterparty (Issuer) to the currency object
      if (market.base.currency !== "XRP")
        order.quantity.issuer = market.base.issuer;
      // Check if counter is XRP, if not, add counterparty (Issuer) to the currency object
      if (market.counter.currency !== "XRP")
        order.totalPrice.issuer = market.counter.issuer;

      setConfirmOrderModal(false);
      // const submit = await submitOrder({
      //   address: accountAddress!,
      //   order,
      // });

      setVolume("");
      setLimitPrice("");

      // submit?.event.on("validated", () => {
      //   void setOpenOrders(wallet?.address || "");
      //   void setFilledOrders(wallet?.address || "");
      // });
    }
  };

  return (
    <div className="order-actions-container">
      <div className="order-actions-content" style={{ padding: "16px" }}>
        {wallet && wallet.address && (
          <div className="order-balances">
            <div className="balance-item">
              <p className="balance-item-header">
                {`${base?.symbol ?? ""} available`}
              </p>
              <FormatNumber
                number={base?.balance || 0}
                className="balance-item-number"
                precision={4}
              />
            </div>

            <div className="balance-item">
              <p className="balance-item-header">
                {`${counter?.symbol ?? ""} Available`}
              </p>
              <FormatNumber
                number={counter?.balance || 0}
                className="balance-item-number"
                precision={4}
              />
            </div>
          </div>
        )}
        <div className="order-switch">
          <div
            className={`switch switch-buy ${
              orderType === OrderType.BUY ? "active" : ""
            }`}
            onClick={() => setOrderType(OrderType.BUY)}
          >
            <p>Buy</p>
          </div>

          <div
            className={`switch switch-sell ${
              orderType === OrderType.SELL ? "active" : ""
            }`}
            onClick={() => setOrderType(OrderType.SELL)}
          >
            <p>Sell</p>
          </div>
        </div>

        <div className="order-trade">
          <div className="order-trade-types">
            <div
              className={`type-item ${
                tradeType === TradeType.MARKET ? "active" : ""
              }`}
              onClick={() => {
                setTradeType(TradeType.MARKET);
              }}
            >
              Market
            </div>
            <div
              className={`type-item ${
                tradeType === TradeType.LIMIT ? "active" : ""
              }`}
              onClick={() => {
                setTradeType(TradeType.LIMIT);
              }}
            >
              Limit
            </div>
          </div>
        </div>

        <div className="order-trade">
          {tradeType === TradeType.LIMIT ? (
            <div className="limit-type-wrapper">
              <Input
                maxLength={16}
                placeholder="Enter Amount"
                type={InputType.NUMBER}
                onValueChange={(val: string) => {
                  setVolume(val);
                }}
                value={volume}
                inputName="volume"
                label="Amount"
                customCss={{
                  fontSize: 14,
                }}
                inputWrapperClassname="order-input"
                adornmentRight={
                  <p className="input-currency">{base?.symbol}</p>
                }
                decimals={13}
              />
              <Input
                maxLength={16}
                placeholder="Enter Limit Price"
                type={InputType.NUMBER}
                onValueChange={(val: string) => {
                  setLimitPrice(val);
                }}
                value={limitPrice}
                inputName="limit-price"
                label="Price"
                customCss={{
                  fontSize: 14,
                }}
                inputWrapperClassname="order-input"
                adornmentRight={
                  <p className="input-currency">{counter?.symbol}</p>
                }
                decimals={13}
              />
            </div>
          ) : (
            <div className="market-type-wrapper">
              <Input
                maxLength={16}
                placeholder="Enter Amount"
                label="Amount"
                type={InputType.NUMBER}
                onValueChange={(val: string) => {
                  setVolume(val);
                }}
                value={volume}
                inputName="volume"
                customCss={{
                  fontSize: 16,
                }}
                adornmentRight={
                  <p className="input-currency">{base?.symbol}</p>
                }
                decimals={13}
              />
            </div>
          )}
        </div>

        <div className="order-bottom">
          <div className="order-total">
            <p className="order-total-label">Total:</p>
            <div className="right">
              <FormatNumber
                number={totalPrice || 0}
                className="order-total-number"
                precision={7}
              />
              <p className="order-total-currency">{counter?.symbol}</p>
            </div>
          </div>

          {!wallet ? (
            <div className="connect-wallet">
              <Button
                variant={ButtonVariant.PRIMARY}
                onClick={() => {
                  setLoginModal(true);
                }}
                image="/trade/images/wallet.svg"
                width={"100%"}
                height={37}
                label="Connect Wallet"
              />
            </div>
          ) : (
            <>
              <Button
                variant={ButtonVariant.PRIMARY}
                onClick={() => {
                  //TODO submit
             
                }}
                image="/trade/images/arrow-right.svg"
                width={"100%"}
                height={37}
                label="Confirm Order"
              />

              {/* {trustlineError ? (
                <p className="error-message">{t("_trustline_error")}</p>
              ) : errorAmount.state ? (
                <p className="error-message">{t("_not_enough_funds_error")}</p>
              ) : null} */}
            </>
          )}
        </div>
      </div>

      {/* <Modal
        classes={{ header: "confirm-order-modal-header" }}
        showModal={confirmOrderModal}
        close={() => setConfirmOrderModal(false)}
        title={t(
          orderType === OrderType.BUY
            ? "_buy_order_summary"
            : "_sell_order_summary"
        )}
        children={
          <div className="confirm-order-modal">
            <div className="confirm-order-modal-header">
              {base && counter && (
                <PairInfo base={base} counter={counter} logoSize={24} />
              )}
              <p
                className={`header-text ${
                  orderType === OrderType.BUY ? "buy" : "sell"
                }`}
              >
                {t(tradeType === TradeType.LIMIT ? "_limit" : "_market")}{" "}
                {t(orderType === OrderType.BUY ? "_buy" : "_sell")}{" "}
              </p>
            </div>
            <div className="confirm-order-modal-content">
              <div className="content-item">
                <p className="content-item-label">{t("_amount")}</p>
                <FormatNumber number={volume} className="content-item-text" />
                <p className="content-item-currency">{base?.symbol}</p>
              </div>
              {tradeType === TradeType.LIMIT && (
                <div className="content-item">
                  <p className="content-item-label">{t("_limit_price")}</p>
                  <FormatNumber
                    number={limitPrice}
                    className="content-item-text"
                  />
                  <p className="content-item-currency">{counter?.symbol}</p>
                </div>
              )}

              <div className="content-item">
                <p className="content-item-label">{t("_time_in_force")}</p>
                <p className="content-item-text">
                  {tradeType === TradeType.MARKET
                    ? TIME_POLICY.immediateOrCancel
                    : timeInForce}
                </p>
              </div>
              {tradeType === TradeType.LIMIT &&
                timeInForce === TIME_POLICY.goodTilTime &&
                timeToCancel === TIME_SELECTION.CUSTOM && (
                  <div className="content-item">
                    <p className="content-item-label">
                      {t("_expiration_date")}
                    </p>
                    <p className="content-item-text">
                      {dayjs(expirationTime).format("h:mm A MMM Do, YYYY")}
                    </p>
                  </div>
                )}
              <div className="content-item">
                <p className="content-item-label">{t("_execution")}</p>
                <p className="content-item-text">
                  {t(
                    tradeType === TradeType.MARKET
                      ? "_standard"
                      : isPassive
                      ? "_passive"
                      : "_standard"
                  )}
                </p>
              </div>
              <div className="content-item">
                <p className="content-item-label">{t("_fee")}</p>
                <FormatNumber
                  number={
                    feeEscalation?.recommend
                      ? feeEscalation.suggestion.xrp
                      : serverInfo?.validated_ledger?.base_fee_xrp || 0.001
                  }
                  className="content-item-text"
                />
                <p className="content-item-currency">XRP</p>
              </div>
              <div className="content-item">
                <p className="content-item-label">{t("_total")}</p>
                <FormatNumber
                  number={totalPrice}
                  className="content-item-text"
                  precision={6}
                />
                <p className="content-item-currency">{counter?.symbol}</p>
              </div>
            </div>
            <Button
              content={t("_confirm_order")}
              onClick={() => {
                void handlePlaceOrder(tradeType, orderType);
              }}
              variant={
                orderType === OrderType.BUY
                  ? ButtonVariant.GREEN
                  : ButtonVariant.DEFAULT
              }
              width={"100%"}
              height={37}
              fontSize={14}
            />
          </div>
        }
      /> */}
    </div>
  );
};

export default OrderActions;
