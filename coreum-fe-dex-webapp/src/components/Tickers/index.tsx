import { useEffect, useState } from "react";
import { tickers } from "@/mock/tickers";
import { toFixedDown } from "@/utils";
import "./Tickers.scss";
import { FormatNumber } from "../FormatNumber";

const denom =
  "dextestdenom9-devcore1p0edzyzpazpt68vdrjy20c42lvwsjpvfzahygs_dextestdenom1-devcore1p0edzyzpazpt68vdrjy20c42lvwsjpvfzahygs";
const denom2 =
  "dextestdenom9-devcore1p0edzyzpazpt68vdrjy20c42lvwsjpvfzahygs_dextestdenom1-devcore1p0edzyzpazpt68vdrjy20c42lvwsjpvfzahygs";

const Tickers = () => {
  const [change, setChange] = useState<number | string>(0);

  useEffect(() => {
    if (tickers) {
      const { open_price, last_price } = tickers.tickers[denom];
      const difference = Number(last_price) - Number(open_price);
      const change = 100 * (difference / Number(open_price));
      setChange(toFixedDown(Number(change), 2));
    }
  }, []);

  //TODO figure out the denoms and usdTickers?
  return (
    <div className="tickers-container">
      <div className="price-container">
        <div className="price">
          <FormatNumber
            number={
              tickers.tickers[denom] ? tickers.tickers[denom].last_price : 0
            }
            precision={6}
          />
        </div>
        <div
          className={`change ${Number(change) > 0 ? "positive" : "negative"}`}
        >
          <span>{Number(change) >= 0 ? "+" : ""}</span>
          {change}
        </div>
      </div>

      <div className="volume-base">
        <div className="label">{`24h Volume ()`}</div>
        <div className="volume">
          <FormatNumber
            number={tickers.tickers[denom] ? tickers.tickers[denom].volume : 0}
            precision={4}
          />
        </div>
      </div>

      <div className="volume-counter">
        <div className="label">{`24h Volume ()`}</div>
        <div className="volume">
          <FormatNumber
            number={
              tickers.usdTickers[denom2] ? tickers.tickers[denom].volume : 0
            }
            precision={4}
          />
        </div>
      </div>

      <div className="high">
        <div className="label">{`24h High`}</div>
        <div className="volume">
          <FormatNumber
            number={
              tickers.tickers[denom] ? tickers.tickers[denom].high_price : 0
            }
            precision={4}
          />
        </div>
      </div>

      <div className="low">
        <div className="label">{`24h Low`}</div>
        <div className="volume">
          <FormatNumber
            number={
              tickers.tickers[denom] ? tickers.tickers[denom].low_price : 0
            }
            precision={4}
          />
        </div>
      </div>
    </div>
  );
};

export default Tickers;
