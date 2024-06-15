import React from "react";
import "./style/dailyTransactionStyle.css";

export default function DailyTransaction() {
  return (
    <div className="daily-transaction-container">
      <div className="daily-transaction">
        <h2>Daily Transaction</h2>
        <div className="daily-transaction-content">
          <div className="daily-transaction-content-item">
            <p>Today</p>
            <span>$ 123.00</span>
          </div>
          <div className="daily-transaction-content-item">
            <p>Yesterday</p>
            <span>$ 123.00</span>
          </div>
          <div className="daily-transaction-content-item">
            <p>Today</p>
            <span>$ 123.00</span>
          </div>
          <div className="daily-transaction-content-item">
            <p>Today</p>
            <span>$ 123.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
