import React, { useState } from "react";
import "./style/bankprofit.css";

const BankDropdown = ({ bankList, handleSelect, handleRemove }) => {
  const [visible, setVisible] = useState(false);
  const [selectedBanks, setSelectedBanks] = useState([]);

  const handleCheckboxChange = (bank, isChecked) => {
    if (isChecked) {
      setSelectedBanks([...selectedBanks, bank]);
      handleSelect(bank);
    } else {
      const updatedBanks = selectedBanks.filter(
        (selectedBank) => selectedBank._id !== bank._id
      );
      setSelectedBanks(updatedBanks);
      handleRemove(bank);
    }
  };

  const toggleDropdown = () => {
    setVisible(!visible);
  };
  const getLastFourDigits = (accountNumber) => {
    return accountNumber.slice(-4);
  };

  return (
    <div
      id="list1"
      className={`dropdown-check-list ${visible ? "visible" : ""}`}
      tabIndex="100"
    >
      <span className="anchor" onClick={toggleDropdown}>
        Filter by Bank
      </span>
      <ul className="items">
        {bankList.map((bank) => (
          <li key={bank._id}>
            <label>
              <input
                type="checkbox"
                value={bank.accountNo}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleSelect(e);
                  } else {
                    handleRemove(e);
                  }
                }}
              />
              {bank.bankName} - {getLastFourDigits(bank.accountNo)}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BankDropdown;
