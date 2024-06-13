import React from "react";
import './style/invoiceStyle.css'

export default function Invoice(props) {
  return (
    <div className="invoice">
      <h3>{props.name}</h3>
      <div className="horizontal-divider"></div>
      <div className="data">
        <p>{props.desc}</p>
        <div className="vertical-divider"></div>
        <span>{props.price}</span>
      </div>
    </div>
  );
}
