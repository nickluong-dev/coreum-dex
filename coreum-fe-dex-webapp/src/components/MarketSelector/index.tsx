import { useEffect, useRef, useState } from "react";
import { markets } from "@/mock/markets";
import "./MarketSelector.scss";
import { Input, InputType } from "../Input";
import Button, { ButtonVariant } from "../Button";

const ActiveTabType = {
  FAV: "fav",
  POPULAR: "popular",
};

const MarketSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | undefined>(
    markets[0].symbol
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMarkets, setFilteredMarkets] = useState(markets);
  const [activeTab, setActiveTab] = useState(ActiveTabType.POPULAR);
  const ref = useRef<HTMLDivElement>(null);

  const toggleMarket = () => setIsOpen((prev) => !prev);

  

  // TODO change market here
  const handleClick = (item: any) => {
    setSelectedLabel(item.symbol);
    setIsOpen(false);
  };

  useEffect(() => {
    setFilteredMarkets(
      markets.filter((item) =>
        item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="market-selector-container" ref={ref}>
      {/* Market Label Button */}
      <div className="market-label" onClick={toggleMarket}>
        <div className="market-label-selected">{selectedLabel}</div>
        <img
          className={`market-arrow ${isOpen ? "rotate" : ""}`}
          src="/trade/images/arrow.svg"
          alt="arr"
        />
      </div>

      {/* Market List Dropdown */}
      <div className={`market-list ${isOpen ? "open" : ""}`}>
        {/* Search and Tabs */}
        <div className="search">
          <Input
            inputName="search"
            type={InputType.TEXT}
            value={searchQuery}
            placeholder={"Search token"}
            height={43}
            onValueChange={setSearchQuery}
          />
          <Button label="Create Pair" variant={ButtonVariant.SECONDARY} />
        </div>

        <div className="tabs">
          <div
            className={`tab ${activeTab === ActiveTabType.FAV ? "active" : ""}`}
            onClick={() => setActiveTab(ActiveTabType.FAV)}
          >
            Fav
          </div>
          <div
            className={`tab ${
              activeTab === ActiveTabType.POPULAR ? "active" : ""
            }`}
            onClick={() => setActiveTab(ActiveTabType.POPULAR)}
          >
            Popular
          </div>
        </div>

        <div className="market-list-header">
          <div className="pair">Pair</div>
          <div className="price">Last Price</div>
          <div className="change">24h Change</div>
        </div>

        <ul className="market-list-content">
          {filteredMarkets.map((item, index) => (
            <li
              key={index}
              className="market-item"
              onClick={() => handleClick(item)}
            >
              <div className="pair-wrapper">
                <img src="/trade/images/star.svg" alt="" />
                <div className="pair">{item.symbol}</div>
              </div>
              <div className="price">{item.last_price || "-"}</div>
              <div
                className={`change ${
                  Number(item["24h_change"]) > 0 ? "positive" : "negative"
                }`}
              >
                {Number(item["24h_change"]) > 0 ? "+" : ""}
                {item["24h_change"] ? `${item["24h_change"]}%` : "-"}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MarketSelector;
