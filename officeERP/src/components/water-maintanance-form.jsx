import React, { useState } from "react";
import "./style/memberListStyle.css";
import { ToastContainer } from "react-toastify";
import { showSuccessToastMessage, showErrorToastMessage } from "./toastUtils";
import axios from "axios";
import "./style/waterMaintainance.css"

export default function WaterMaintainanceForm() {
  const [bills, setBills] = useState([
    {
      memberNumber: "",
      memberName: "",
      plotNumber: "",
      referenceNumber: "",
      billingMonth: "",
      paidDate: "",
      amount: "",
    },
  ]);

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const updatedBills = [...bills];
    updatedBills[index][name] = value;
    setBills(updatedBills);
  };

  const addNewBill = () => {
    setBills([
      ...bills,
      {
        memberNumber: "",
        memberName: "",
        plotNumber: "",
        referenceNumber: "",
        billingMonth: "",
        paidDate: "",
        amount: "",
      },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nonEmptyBills = bills.filter(bill => 
        bill.memberNumber.trim() || 
        bill.plotNumber.trim() || 
        bill.referenceNumber.trim() || 
        bill.billingMonth.trim() || 
        bill.paidDate.trim() || 
        bill.amount.trim()
      );
      const invalidBills = nonEmptyBills.filter(bill => !bill.memberNumber.trim());

      // Validate if all valid bills have a memberNumber
      if (invalidBills.length > 0) {
        showErrorToastMessage("Please provide a Member Number for all bills.");
        return;
      }
  
      const data = {
        member_no: nonEmptyBills.map(bill => bill.memberNumber).join(','),
        plot_no: nonEmptyBills.map(bill => bill.plotNumber).join(','),
        reference_no: nonEmptyBills.map(bill => bill.referenceNumber).join(','),
        billing_month: nonEmptyBills.map(bill => bill.billingMonth).join(','),
        paid_date: nonEmptyBills.map(bill => bill.paidDate).join(','),
        amount: nonEmptyBills.map(bill => bill.amount).join(','),
        head_of_account: "Water/Maintenance Bill"
      };
    console.log(data)
    try {
      const config = {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      };
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/createWaterMaintenanceBill`,
        data,
        config
      );
      console.log(response)
      if (response.status === 201) {
        showSuccessToastMessage("Bills Added Successfully");
        setBills([
          {
            memberNumber: "",
            memberName: "",
            plotNumber: "",
            referenceNumber: "",
            billingMonth: "",
            paidDate: "",
            amount: "",
          },
        ]);
      } else {
        showErrorToastMessage("Error Adding Bills");
      }
    } catch (error) {
      showErrorToastMessage("Error Adding Bills");
      console.log(error);
    }
  };
  
  
  return (
    <>
      <div className="add-purchaser">
        <form action="" onSubmit={handleSubmit} className="water-maintenance-form">
          {bills.map((bill, index) => (
            <div className="purchaser-input-wrapper" key={index}>
                <div>
                <label htmlFor={`memberNumber-${index}`} className="required">
                  Member Num:
                </label>
                <input
                  type="number"
                  name="memberNumber"
                  className="small-input"
                  id={`memberNumber-${index}`}
                  required
                  onChange={(e) => handleInputChange(index, e)}
                  value={bill.memberNumber}
                />
                </div>
                <div>
                <label htmlFor={`plotNumber-${index}`} className="required">
                  Plot Num:
                </label>
                
                <input
                  type="number"
                  name="plotNumber"
                  className="small-input"
                  id={`plotNumber-${index}`}
                  required
                  onChange={(e) => handleInputChange(index, e)}
                  value={bill.plotNumber}
                />
               </div>
               <div>
                <label
                  htmlFor={`referenceNumber-${index}`}
                  className="required"
                >
                  Reference Num:
                </label>
                <input
                  type="number"
                  name="referenceNumber"
                  id={`referenceNumber-${index}`}
                  className="small-input"
                  required
                  onChange={(e) => handleInputChange(index, e)}
                  value={bill.referenceNumber}
                />
                </div>
                <div>
                <label htmlFor={`billingMonth-${index}`} className="required">
                  Billing Month:
                </label>
                <input
                  type="month"
                  name="billingMonth"
                  id={`billingMonth-${index}`}
                  required
                  onChange={(e) => handleInputChange(index, e)}
                  value={bill.billingMonth}
                />
                </div>
                <div>
                <label htmlFor={`paidDate-${index}`} className="required">
                  Paid Date:
                </label>
                <input
                  type="date"
                  name="paidDate"
                  className=""
                  id={`paidDate-${index}`}
                  required
                  onChange={(e) => handleInputChange(index, e)}
                  value={bill.paidDate}
                />
                </div>
                <div>
                <label htmlFor={`amount-${index}`} className="required">
                  Amount:
                </label>
                <input
                  type="number"
                  name="amount"
                  className="small-input"
                  id={`amount-${index}`}
                  required
                  onChange={(e) => handleInputChange(index, e)}
                  value={bill.amount}
                />
                </div>
              </div>
          ))}
          <div className="action-buttons">
          <button onClick={addNewBill} className="blue-button">+ Add New</button>
          <button onClick={handleSubmit} className="blue-button"> Save Bills</button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </>
  );
}
