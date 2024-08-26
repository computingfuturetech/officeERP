import React, { useState } from "react";
import "./style/memberListStyle.css";
import { ToastContainer } from "react-toastify";
import { showSuccessToastMessage, showErrorToastMessage } from "./toastUtils";
import axios from "axios";
import "./style/waterMaintainance.css";

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
      challanNo: "",
    },
  ]);

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const updatedBills = [...bills];
    updatedBills[index][name] = value;
    setBills(updatedBills);
  };
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const checkMemberNumber = async (memberNumber) => {
    try {
      const config = {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      };
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user/getMemberList/?member_no=${memberNumber}`,
        config
      );
      console.log(response);
      if (response.status === 200) {
        return response.data;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  const addNewBill = async () => {
    try {
      if (
        bills[bills.length - 1].memberNumber.trim() === "" ||
        bills[bills.length - 1].plotNumber.trim() === "" ||
        bills[bills.length - 1].referenceNumber.trim() === "" ||
        bills[bills.length - 1].billingMonth.trim() === "" ||
        bills[bills.length - 1].paidDate.trim() === "" ||
        bills[bills.length - 1].amount.trim() === "" ||
        bills[bills.length - 1].challanNo.trim() === ""
      ) {
        showErrorToastMessage("Please fill all the fields");
        return;
      }

      const check = await checkMemberNumber(
        bills[bills.length - 1].memberNumber
      );

      if (check === null) {
        showErrorToastMessage("Member Number does not exist");
      } else {
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
            challanNo: "",
          },
        ]);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const check = await checkMemberNumber(bills[bills.length - 1].memberNumber);

    if (check === null) {
      showErrorToastMessage("Member Number does not exist");
    } else {
      const nonEmptyBills = bills.filter(
        (bill) =>
          bill.memberNumber.trim() ||
          bill.plotNumber.trim() ||
          bill.referenceNumber.trim() ||
          bill.billingMonth.trim() ||
          bill.paidDate.trim() ||
          bill.amount.trim()
      );
      const invalidBills = nonEmptyBills.filter(
        (bill) => !bill.memberNumber.trim()
      );
      if (invalidBills.length > 0) {
        showErrorToastMessage("Please provide a Member Number for all bills.");
        return;
      }

      const data = {
        member_no: nonEmptyBills.map((bill) => bill.memberNumber).join(","),
        plot_no: nonEmptyBills.map((bill) => bill.plotNumber).join(","),
        reference_no: nonEmptyBills
          .map((bill) => bill.referenceNumber)
          .join(","),
        billing_month: nonEmptyBills.map((bill) => bill.billingMonth).join(","),
        paid_date: nonEmptyBills.map((bill) => bill.paidDate).join(","),
        amount: nonEmptyBills.map((bill) => bill.amount).join(","),
        challan_no: nonEmptyBills.map((bill) => bill.challanNo).join(","),
      };
      console.log(data);
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
        console.log(response);
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
              challanNo: "",
            },
          ]);
        } else {
          showErrorToastMessage("Error Adding Bills");
        }
      } catch (error) {
        showErrorToastMessage("Error Adding Bills");
        console.log(error);
      }
    }
  };

  return (
    <>
      <div className="water-maintainance">
        <div className="title">
          <h2>Add Water Maintainance</h2>
        </div>
        <div className="add-purchaser">
          <div className="water-maintenance-form">
            {bills.map((bill, index) => (
              <div className="purchaser-input-wrapper block-label" key={index}>
                <div className="block-label">
                  <label htmlFor={`memberNumber-${index}`} className="required">
                    Member Num:
                  </label>
                  <input
                    type="text"
                    name="memberNumber"
                    className="small-input"
                    id={`memberNumber-${index}`}
                    required
                    onChange={(e) => handleInputChange(index, e)}
                    value={bill.memberNumber}
                  />
                </div>
                <div className="block-label">
                  <label htmlFor={`challanNo-${index}`} className="required">
                    Challan No:
                  </label>

                  <input
                    type="number"
                    name="challanNo"
                    className="small-input"
                    id={`challanNo-${index}`}
                    required
                    onChange={(e) => handleInputChange(index, e)}
                    value={bill.challanNo}
                  />
                </div>

                <div className="block-label">
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
                <div className="block-label">
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
                <div className="block-label">
                  <label htmlFor={`billingMonth-${index}`} className="required">
                    Billing Month:
                  </label>
                  <select
                    name="billingMonth"
                    id="billingMonth-${index}"
                    value={bill.billingMonth}
                    onChange={(e) => handleInputChange(index, e)}
                  >
                    <option value="" hidden>
                      Select
                    </option>
                    {months.map((month, index) => (
                      <option key={index} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                  {/* <input
                    type="month"
                    name="billingMonth"
                    id={`billingMonth-${index}`}
                    required
                    onChange={(e) => handleInputChange(index, e)}
                    value={bill.billingMonth}
                  /> */}
                </div>
                <div className="block-label">
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
                <div className="block-label">
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
              <button onClick={addNewBill} className="blue-button">
                + Add New
              </button>
              <button onClick={handleSubmit} className="blue-button">
                {" "}
                Save Bills
              </button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
