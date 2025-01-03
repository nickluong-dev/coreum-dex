import { Fragment, useRef } from "react";
// import { useStore } from "@/state";
import "./ExchangeHistory.scss";
import dayjs from "dayjs";
import { tradeHistory } from "@/mock/trades";
// const tradeHistory = null;

const ExchangeHistory = () => {
  // const { market, network } = useStore();
  // const [beforeId, setBeforeId] = useState<string | undefined>(undefined);
  const historyRef = useRef<HTMLDivElement>(null);

  // Fetch trade history every 15 seconds
  // useEffect(() => {
  //   void setTradeHistory();
  //   const tradeHistoryInterval = setInterval(() => {
  //     void setTradeHistory();
  //   }, 15000);

  //   return () => {
  //     clearInterval(tradeHistoryInterval);
  //   };
  // }, [network, market]);

  // fetch more data when beforeId changes
  // useEffect(() => {
  //   if (beforeId) {
  //     void setTradeHistory(beforeId);
  //   }
  // }, [beforeId]);

  const getTradeHistory = () => {
    return tradeHistory;
  };

  // handle scrolling
  // useEffect(() => {
  //   if (!historyRef.current) return;

  //   const handleScroll = () => {
  //     const historyBodyElement = historyRef.current;
  //     if (!historyBodyElement) return;

  //     const { scrollTop, scrollHeight, clientHeight } = historyBodyElement;
  //     if (scrollTop + clientHeight >= scrollHeight) {
  //       if (getTradeHistory().length > 0) {
  //         const currentBeforeId =
  //           getTradeHistory()[getTradeHistory().length - 1].id;

  //         setBeforeId(currentBeforeId);
  //       }
  //     }
  //   };

  //   const historyBodyElementCurrent = historyRef.current;
  //   if (historyBodyElementCurrent) {
  //     historyBodyElementCurrent.addEventListener("scroll", handleScroll);
  //   }

  //   return () => {
  //     if (historyBodyElementCurrent) {
  //       historyBodyElementCurrent.removeEventListener("scroll", handleScroll);
  //     }
  //   };
  // }, [getTradeHistory]);

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
