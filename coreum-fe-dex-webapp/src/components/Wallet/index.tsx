import { useState } from "react";
import "./Wallet.scss";
import { useStore } from "@/state";

const Wallet = <T,>({}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { wallet } = useStore();

  const togglewallet = () => setIsOpen((prev) => !prev);
  const closewallet = () => setIsOpen(false);

  const handleItemClick = () => {
    closewallet();
  };

  const walletItems = [
    {
      label: "Copy Address",
      action: () => {
        console.log("copy");
      },
      image: "",
    },
    {
      label: "Switch Wallet",
      action: () => {
        console.log("switch");
      },
      image: "",
    },
    {
      label: "Open Explorer",
      action: () => {
        console.log("open");
      },
      image: "",
    },
    {
      label: "Disconnect",
      action: () => {
        console.log("disconnect");
      },
      image: "",
    },
  ];

  return (
    <div className={`wallet wallet`}>
      <button className="wallet-label" onClick={togglewallet}>
        <div className="wallet-label-selected">{wallet && wallet.address}</div>
        <img
          className={`wallet-arrow ${isOpen ? "rotate" : ""}`}
          src="/trade/images/arrow.svg"
          alt="arr"
        />
      </button>

      <div className={`wallet-list ${isOpen ? "open" : ""}`}>
        <ul className="wallet-list-content">
          {walletItems.map((item, index) => (
            <li key={index}>
              <div
                className="wallet-item"
                onClick={() => {
                  try {
                    item.action();
                  } catch {
                    console.log("error");
                  }
                }}
              >
                {item.label}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Wallet;
