import React, { useRef, useState, useEffect } from "react";
import "./Header.scss";
import Dropdown, { DropdownVariant } from "../Dropdown";
import Button from "../Button";
import { useStore } from "@/state";
import Wallet from "../Wallet";
import { CoreumNetwork } from "coreum-js";
import Tickers from "../Tickers";
import MarketSelector from "../MarketSelector";

const Header = () => {
  const { wallet, network, setLoginModal, startCoreum } = useStore();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);

  //calculate scroll buttons visibility
  useEffect(() => {
    const updateScrollButtons = () => {
      const container = scrollContainerRef.current;
      if (container) {
        const canScrollLeft = container.scrollLeft > 0;
        const canScrollRight =
          container.scrollLeft + container.clientWidth < container.scrollWidth;

        setShowLeftButton(canScrollLeft);
        setShowRightButton(canScrollRight);
      }
    };

    updateScrollButtons();
    window.addEventListener("resize", updateScrollButtons);

    return () => window.removeEventListener("resize", updateScrollButtons);
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 100; // Adjust scroll distance as needed
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleScrollEvent = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const canScrollLeft = container.scrollLeft > 0;
      const canScrollRight =
        container.scrollLeft + container.clientWidth < container.scrollWidth;

      setShowLeftButton(canScrollLeft);
      setShowRightButton(canScrollRight);
    }
  };

  return (
    <div className="header-container">
      <div className="left">
        {/* logo */}
        <img
          src="/trade/images/coreum-logo.svg"
          alt="Coreum"
          draggable={false}
        />

        {/* divider */}
        <div className="vertical-divider"></div>

        <div className="market">
          <MarketSelector />
        </div>
      </div>

      <div className="middle">
        {showLeftButton && (
          <button
            className="scroll-button left"
            onClick={() => handleScroll("left")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="18"
              viewBox="0 0 17 18"
              fill="none"
            >
              <path
                d="M7.92556 6.98444C8.12418 6.76375 8.47023 6.76375 8.66886 6.98444L11.9176 10.5942C12.2072 10.9159 11.9788 11.4286 11.546 11.4286H5.04846C4.61558 11.4286 4.38723 10.9159 4.67682 10.5942L7.92556 6.98444Z"
                fill="#25D695"
              />
            </svg>
          </button>
        )}
        <div
          className="scroll-container"
          ref={scrollContainerRef}
          onScroll={handleScrollEvent}
        >
          <Tickers />
        </div>
        {showRightButton && (
          <button
            className="scroll-button right"
            onClick={() => handleScroll("right")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="18"
              viewBox="0 0 17 18"
              fill="none"
            >
              <path
                d="M7.92556 6.98444C8.12418 6.76375 8.47023 6.76375 8.66886 6.98444L11.9176 10.5942C12.2072 10.9159 11.9788 11.4286 11.546 11.4286H5.04846C4.61558 11.4286 4.38723 10.9159 4.67682 10.5942L7.92556 6.98444Z"
                fill="#25D695"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="right">
        {/* network selector */}
        <Dropdown
          variant={DropdownVariant.NETWORK}
          items={[
            CoreumNetwork.MAINNET.toUpperCase(),
            CoreumNetwork.TESTNET.toUpperCase(),
          ]}
          value={network.toUpperCase()}
          image="/trade/images/connect.svg"
          renderItem={(item) => (
            <div
              className="network-item"
              onClick={() => {
                if (item === CoreumNetwork.MAINNET.toUpperCase()) {
                  console.log("Switching to Mainnet");
                  startCoreum(CoreumNetwork.MAINNET);
                } else {
                  console.log("Switching to Testnet");
                  startCoreum(CoreumNetwork.TESTNET);
                }
              }}
            >
              {item.toUpperCase()}
            </div>
          )}
        />

        {/* wallet connect button */}
        {wallet ? (
          <Wallet />
        ) : (
          <Button
            onClick={() => setLoginModal(true)}
            label="Connect Wallet"
            image="/trade/images/wallet.svg"
            variant="primary"
          />
        )}
      </div>
    </div>
  );
};

export default Header;
