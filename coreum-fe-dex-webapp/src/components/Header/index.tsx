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
          <Tickers />
        </div>
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
