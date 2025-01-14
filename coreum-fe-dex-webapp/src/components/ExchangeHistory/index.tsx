import { Fragment, useRef } from "react";
import "./ExchangeHistory.scss";
import dayjs from "dayjs";
import { tradeHistory } from "@/mock/trades";

const ExchangeHistory = () => {
  const historyRef = useRef<HTMLDivElement>(null);

  return (
    <div className="exchange-history-container">
      <div className="exchange-history-title">Exchange History</div>

      <div className="header">
        <div className="exchange-history-body-row label">Price</div>
        <div className="exchange-history-body-row label">Volume</div>
        <div className="exchange-history-body-row label time">Time</div>
      </div>

      {tradeHistory && tradeHistory.length > 0 ? (
        <div ref={historyRef} className="exchange-history-body-rows">
          {tradeHistory.map((trade: any, index: number) => {
            return (
              <Fragment key={index}>
                <div
                  className={`exchange-history-body-row  ${
                    trade.Side === "BUY" ? "positive" : "negative"
                  }`}
                >
                  {Number(trade.Price).toFixed(5)}
                </div>
                <div className="exchange-history-body-row volume">
                  {Number(trade.Amount).toFixed(5)}
                </div>
                <div className="exchange-history-body-row time">
                  {dayjs(trade.MetaData.CreatedAt.seconds).format("HH:mm:ss")}
                </div>
              </Fragment>
            );
          })}
        </div>
      ) : (
        <div className="no-data-container">
          <img src="/trade/images/warning.png" alt="warning" />
          <p className="no-data">No Data Found</p>
        </div>
      )}
    </div>
  );
};

export default ExchangeHistory;
