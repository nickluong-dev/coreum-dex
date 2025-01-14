import "./OrderActions.scss";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { useStore } from "@/state";
import { OrderType, TradeType, OrderbookAction, IToken } from "@/types/market";
import { getAvgPriceFromOBbyVolume, multiply, noExponents } from "@/utils";
import { FormatNumber } from "../FormatNumber";
import "./OrderActions.scss";
import { Input, InputType } from "../Input";
import Button, { ButtonVariant } from "../Button";

dayjs.extend(utc);
dayjs.extend(advancedFormat);

const OrderActions = ({
  orderbookAction,
}: {
  orderbookAction?: OrderbookAction;
}) => {
  const { orderbook, wallet, setLoginModal, pushNotification } = useStore();

  const [orderType, setOrderType] = useState<OrderType>(OrderType.BUY);
  const [base, _] = useState<IToken>();
  const [counter, __] = useState<IToken>();

  const [totalPrice, setTotalPrice] = useState(0);
  const [limitPrice, setLimitPrice] = useState("");

  const [volume, setVolume] = useState<string>("");
  const [tradeType, setTradeType] = useState(TradeType.MARKET);

  // const { data: balances } = useBalances({
  //   bech32Address: wallet?.address ?? "",
  // });
  // const test = useChainInfo({
  //   chainId: coreummainnet.chainId,
  // });

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

        const expRegex = /[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)/g;
        const total = multiply(avgPrice, vol).toNumber();
        setTotalPrice(
          !expRegex.test(total.toString()) && !isNaN(total) ? total : 0
        );
      }
    }
  }, [volume, limitPrice, orderbook, tradeType, orderType]);

  return (
    <div className="order-actions-container">
      <div className="order-actions-content" style={{ padding: "16px" }}>
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
                  pushNotification({
                    type: "success",
                    message: "Order Placed",
                  });
                }}
                image="/trade/images/arrow-right.svg"
                width={"100%"}
                height={37}
                label="Confirm Order"
              />
            </>
          )}
        </div>
      </div>

      {/* //TODO add balances when market is done */}
      <div className="available-balances">
        <p className="title">Assets</p>
        <div className="balance-row">
          <p className="balance-label">Balance One</p>
          <p className="balance-value">0</p>
        </div>

        <div className="balance-row">
          <p className="balance-label">Balance Two</p>
          <p className="balance-value">0</p>
        </div>
      </div>
    </div>
  );
};

export default OrderActions;
