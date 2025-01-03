import { useEffect, useRef, useState } from "react";
import { markets } from "@/mock/markets";
import "./MarketSelector.scss";
import { Input, InputType } from "../Input";
import Button, { ButtonVariant } from "../Button";
import Modal from "../Modal";
import Dropdown, { DropdownVariant } from "../Dropdown";

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
  const [openCreatePairModal, setOpenCreatePairModal] = useState(false);
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
      if (ref.current && !ref.current.contains(event.target as Node)) {
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
          <Button
            label="Create Pair"
            variant={ButtonVariant.SECONDARY}
            onClick={() => {
              setOpenCreatePairModal(true);
            }}
          />
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

      <Modal
        isOpen={openCreatePairModal}
        onClose={() => setOpenCreatePairModal(false)}
        title="Create Pair"
        width={640}
      >
        <div className="create-pair-row">
          {/* TODO reolace items with actual currencies */}
          <Dropdown
            variant={DropdownVariant.OUTLINED}
            value="USD"
            items={[
              { symbol: "USD", image: "/trade/images/connect.svg" },
              { symbol: "EUR", image: "/trade/images/connect.svg" },
            ]}
            getvalue={(item) => item.symbol}
            renderItem={(item) => (
              <div>
                <img
                  src={item.image}
                  alt={item.symbol}
                  style={{ width: "20px", marginRight: "10px" }}
                />
                {item.symbol}
              </div>
            )}
            label="Base Token"
          />

          <div className="swap">
            <img
              src="/trade/images/swap.svg"
              alt="swap"
              onClick={() => {
                // TODO swap base and quote tokens
              }}
            />
          </div>

          <Dropdown
            variant={DropdownVariant.OUTLINED}
            items={[{ symbol: "USD", image: "/trade/images/connect.svg" }]}
            label="Base Token"
            value={"test"}
            image="/trade/images/connect.svg"
            renderItem={(item) => (
              <div className="network-item" onClick={() => {}}>
                test
              </div>
            )}
          />
        </div>
      </Modal>
    </div>
  );
};

export default MarketSelector;
