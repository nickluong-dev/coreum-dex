import Orderbook from "@/components/Orderbook";
import TradingView from "@/components/TradingView";
import OrderActions from "@/components/OrderActions";
import "./home.scss";
import Header from "@/components/Header";
import { useState } from "react";
import { OrderbookAction } from "@/types/market";
import Modal from "@/components/Modal";
import { useStore } from "@/state";
import LoginSelection from "@/components/LoginSelection";
import ExchangeHistory from "@/components/ExchangeHistory";
import OrderHistory from "@/components/OrderHistory";

const Home = () => {
  const [orderbookAction, setOrderbookAction] = useState<OrderbookAction>();
  const { loginModal, setLoginModal } = useStore();

  return (
    <div className="home-container">
      <Header />

      <div className="row">
        <Orderbook setOrderbookAction={setOrderbookAction} />
        <TradingView />
        <OrderActions orderbookAction={orderbookAction} />
      </div>

      <div className="row">
        <ExchangeHistory />
        <OrderHistory />
      </div>

      <Modal
        isOpen={loginModal}
        title="Connect Coreum Wallet"
        onClose={() => setLoginModal(false)}
      >
        <LoginSelection closeModal={() => setLoginModal(false)} />
      </Modal>
    </div>
  );
};

export default Home;
