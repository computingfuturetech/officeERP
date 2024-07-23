import React, { useEffect, useState, useRef } from "react";
import "./style/memberListStyle.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "./style/purchaser.css";
import { showSuccessToastMessage, showErrorToastMessage } from "./toastUtils";

export default function PurchaserComponent() {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [purchaseData, setPurchaseData] = useState([]);
  const membersRef = useRef(null);
  const [addDues, setAddDues] = useState(false);
  const [updateMemberState, setUpdateMemberState] = useState([]);

  const handleScroll = () => {
    if (membersRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = membersRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 50 && !loading) {
        setPage((prevPage) => prevPage + 1);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      };
      const body = {
        ms_no: purchaseData.purchaserId,
        purchase_name: purchaseData.purchaserName,
        cnic_no: purchaseData.purchaserCnic,
        address: purchaseData.purchaserAddress,
        area: purchaseData.purchaserArea,
        phase: purchaseData.purchaserPhase,
        block: purchaseData.purchaserBlock,
        plot_no: purchaseData.purchaserPlot,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/createMember`,
        body,
        config
      );
      if (response.status === 200) {
        showSuccessToastMessage("Purchaser Added Successfully");
        setAddDues(true);
      } else {
        showErrorToastMessage("Error Adding Purchaser");
      }
      setPurchaseData({
        purchaserId: "",
        purchaserName: "",
        purchaserCnic: "",
        purchaserAddress: "",
        purchaserArea: "",
        purchaserPhase: "",
        purchaserBlock: "",
        purchaserPlot: "",
      });
    } catch (error) {
      showErrorToastMessage("Error Adding Purchaser");

      console.log(error);
    }
  };

  useEffect(() => {
    if (membersRef.current) {
      membersRef.current.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (membersRef.current) {
        membersRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, [loading]);

  const handleCnicChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^\d-]/g, "");

    if (value.length === 6 && !value.includes("-")) {
      value = value.slice(0, 5) + "-" + value.slice(5);
    } else if (value.length === 14 && value.split("-").length === 2) {
      value = value.slice(0, 13) + "-" + value.slice(13);
    }

    if (e.nativeEvent.inputType === "deleteContentBackward") {
      if (value.length === 6) {
        value = value.slice(0, 5);
      } else if (value.length === 14) {
        value = value.slice(0, 13);
      }
    }

    setPurchaseData({
      ...purchaseData,
      purchaserCnic: value.slice(0, 15),
    });
  };

  const closeSection = () => {
    setAddDues(false);
  }

  const updateMember = (e) => {
    e.preventDefault();

    const data = {
      ms_no: updateMemberState.msNo,
      purchase_name: updateMemberState.purchaseName,
      challan_no: updateMemberState.challanNumber,
      date: updateMemberState.date,
      noc_fee: updateMemberState.nocFee,
      masjid_fund: updateMemberState.masjidFund,
      dual_owner_fee: updateMemberState.dualOwnerFee,
      covered_area_fee: updateMemberState.coveredAreaFee,
      share_money: updateMemberState.shareMoney,
      deposit_land_cost: updateMemberState.depositLandCost,
      deposit_development_charges: updateMemberState.depositDevelopmentCharges,
      additional_charges: updateMemberState.additionalCharges,
      electricity_charges: updateMemberState.electricityCharges,
    };
    
    const update = async () => {
      try {
        const config = {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        };
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/user/updateMember`,
          data,
          config
        );
        closeSection();
      } catch (error) {
        console.error(error);
      }
    };
    update();
  };

  

  return (
    <div className="member-list">
      <div className="title">
        <h2>Add New Purchaser</h2>
        <div className="title-buttons">
          <Link className="blue-button" onClick={()=> setAddDues(true)}>
            Existing Member
          </Link>
        </div>
      </div>

      <div className="horizontal-divider divider-margin"></div>
      <div className="add-purchaser">
        <form action="">
          <div className="purchaser-input">
            <div className="purchaser-input-wrapper">
              <div className="input">
                <label htmlFor="purchaser-id" className="required">Purchaser Id:</label>
                <input
                  type="text"
                  name="purchaser-id"
                  id="purchaser-id"
                  placeholder="111"
                  required
                  onChange={(e) => {
                    setPurchaseData({
                      ...purchaseData,
                      purchaserId: e.target.value,
                    });
                  }}
                  value={purchaseData.purchaserId}
                />
              </div>
              <div className="input">
                <label htmlFor="purchaser-name" className="required">Purchaser Name:</label>
                <input
                  type="text"
                  name="purchaser-name"
                  id="purchaser-name"
                  placeholder="John Doe"
                  required
                  onChange={(e) => {
                    setPurchaseData({
                      ...purchaseData,
                      purchaserName: e.target.value,
                    });
                  }}
                  value={purchaseData.purchaserName}
                />
              </div>
              <div className="input">
                <label htmlFor="purchaser-cnic" className="required">CNIC No:</label>
                <input
                  type="text"
                  name="purchaser-cnic"
                  id="purchaser-cnic"
                  placeholder="00000-0000000-0"
                  required
                  onChange={handleCnicChange}
                  value={purchaseData.purchaserCnic}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
              <div className="input address">
                <label htmlFor="purchaser-address">Address:</label>
                <input
                  type="text"
                  name="purchaser-address"
                  id="purchaser-address"
                  placeholder="Lahore, Punjab"
                  onChange={(e) => {
                    setPurchaseData({
                      ...purchaseData,
                      purchaserAddress: e.target.value,
                    });
                  }}
                  value={purchaseData.purchaserAddress}
                />
              </div>
            </div>
            <div className="purchaser-input-wrapper">
              <div className="input">
                <label htmlFor="purchaser-area">Area:</label>
                <input
                  type="number"
                  name="purchaser-area"
                  id="purchaser-area"
                  placeholder="1"
                  onChange={(e) => {
                    setPurchaseData({
                      ...purchaseData,
                      purchaserArea: e.target.value,
                    });
                  }}
                  value={purchaseData.purchaserArea}
                />
              </div>
              <div className="input">
                <label htmlFor="purchaser-area">Phase:</label>
                <select
                  name="purchaser-area"
                  id="purchaser-area"
                  onChange={(e) => {
                    setPurchaseData({
                      ...purchaseData,
                      purchaserPhase: e.target.value,
                    });
                  }}
                >
                  <option value="select" hidden>
                    Select Phase
                  </option>
                  <option value="I">I</option>
                  <option value="II">II</option>
                </select>
              </div>
              <div className="input">
                <label htmlFor="purchaser-area">Block:</label>
                <select
                  name="purchaser-area"
                  id="purchaser-area"
                  onChange={(e) => {
                    setPurchaseData({
                      ...purchaseData,
                      purchaserBlock: e.target.value,
                    });
                  }}
                >
                  <option value="select" hidden>
                    Select Block
                  </option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              <div className="input">
                <label htmlFor="purchaser-area">Plot No:</label>
                <input
                  type="number"
                  name="purchaser-area"
                  id="purchaser-area"
                  placeholder="1"
                  onChange={(e) => {
                    setPurchaseData({
                      ...purchaseData,
                      purchaserPlot: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </form>
        <div className="blue-button" onClick={handleSubmit}>
          Add Purchaser
        </div>
      </div>
      <div className={`members  ${loading ? "loading" : ""}`} ref={membersRef}>
        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
          </div>
        )}
      </div>
      <ToastContainer />
      {addDues && (
        <div className="left-section">
          <div className="left-section-content">
            <div onClick={closeSection} className="close-button"></div>
            <h3>Add Member Dues</h3>
            <div className="horizontal-divider"></div>
            <form onSubmit={updateMember}>
              <label htmlFor="msNo" className="required">Membership No: </label>
              <input
                type="text"
                name="msNo"
                id="msNo"
                required
                onChange={(e) => setUpdateMemberState(
                  {...updateMemberState,
                  msNo: e.target.value}
                )}
              />
              <label htmlFor="purchaseName" className="required">Name: </label>
              <input
                type="text"
                name="purchaseName"
                id="purchaseName"
                className="read-only"
                readOnly
                onChange={(e) =>setUpdateMemberState({
                  ...updateMemberState,
                  purchaseName: e.target.value
                })}
              />
              <label htmlFor="challanNumber" className="required">Challan Number: </label>
              <input
                type="number"
                name="challanNumber"
                id="challanNumber"
                required
                onChange={(e) => setUpdateMemberState({
                  ...updateMemberState,
                  challanNumber: e.target.value
                })}
              />
              <label htmlFor="date" className="required">Date: </label>
              <input
                type="date"
                name="date"
                id="date"
                required
                onChange={(e) => setUpdateMemberState({
                  ...updateMemberState,
                  date: e.target.value
                })}
              />

              <label htmlFor="nocFee">NOC Fee: </label>
              <input
                type="number"
                name="nocFee"
                id="nocFee"
                onChange={(e) => setUpdateMemberState({
                  ...updateMemberState,
                  nocFee: e.target.value
                })}
              />
              <label htmlFor="masjidFund">Masjid Fund: </label>
              <input
                type="number"
                name="masjidFund"
                id="masjidFund"
                onChange={(e) => setUpdateMemberState({
                  ...updateMemberState,
                  masjidFund: e.target.value
                })}
              />
              <label htmlFor="dualOwnerFee">Dual Owner Fee: </label>
              <input
                type="number"
                name="dualOwnerFee"
                id="dualOwnerFee"
                onChange={(e) => setUpdateMemberState({
                  ...updateMemberState,
                  dualOwnerFee: e.target.value
                })}
              />
              <label htmlFor="coveredAreaFee">Covered Area Fee: </label>
              <input
                type="number"
                name="coveredAreaFee"
                id="coveredAreaFee"
                onChange={(e) => setUpdateMemberState({
                  ...updateMemberState,
                  coveredAreaFee: e.target.value
                })}
              />
              <label htmlFor="shareMoney">Share Money: </label>
              <input
                type="number"
                name="shareMoney"
                id="shareMoney"
                onChange={(e) => setUpdateMemberState({
                  ...updateMemberState,
                  shareMoney: e.target.value
                })}
              />
              <label htmlFor="depositLandCost">Deposit For Land Cost: </label>
              <input
                type="number"
                name="depositLandCost"
                id="depositLandCost"
                onChange={(e) => setUpdateMemberState({
                  ...updateMemberState,
                  depositLandCost: e.target.value
                })}
              />
              <label htmlFor="depositDevelopmentCharges">Deposit for Development Charges: </label>
              <input
                type="number"
                name="depositDevelopmentCharges"
                id="depositDevelopmentCharges"
                onChange={(e) => setUpdateMemberState({
                  ...updateMemberState,
                  depositDevelopmentCharges: e.target.value
                })}
              />
              <label htmlFor="additionalCharges">Additional Development Charges: </label>
              <input
                type="number"
                name="additionalCharges"
                id="additionalCharges"
                onChange={(e) => setUpdateMemberState({
                  ...updateMemberState,
                  additionalCharges: e.target.value
                })}
              />
              <label htmlFor="electricityCharges">Electricity Charges: </label>
              <input
                type="number"
                name="electricityCharges"
                id="electricityCharges"
                onChange={(e) => setUpdateMemberState({
                  ...updateMemberState,
                  electricityCharges: e.target.value
                })}
              />
              <button
                type="submit"
                className="blue-button"
                onClick={updateMember}
              >
                Save
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
