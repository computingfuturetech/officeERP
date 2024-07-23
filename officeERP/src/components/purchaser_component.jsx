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

  const handleScroll = () => {
    console.log("scrolling");
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

      console.log(body);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/createMember`,
        body,
        config
      );
      console.log(response);
      if (response.status === 200) {
        showSuccessToastMessage("Purchaser Added Successfully");
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

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleCnicChange = (e) => {
    let value = e.target.value;
    // Remove any non-numeric characters except for hyphens
    value = value.replace(/[^\d-]/g, "");

    // Automatically add hyphens at appropriate positions
    if (value.length === 6 && !value.includes("-")) {
      value = value.slice(0, 5) + "-" + value.slice(5);
    } else if (value.length === 14 && value.split("-").length === 2) {
      value = value.slice(0, 13) + "-" + value.slice(13);
    }

    // Handle backspace to remove hyphens
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

  return (
    <div className="member-list">
      <div className="title">
        <h2>Add New Purchaser</h2>
        <div className="title-buttons">
          <Link className="simple-button" onClick={handleRefresh}>
            Refresh
          </Link>
        </div>
      </div>

      <div className="horizontal-divider divider-margin"></div>

      <div className="add-purchaser">
        <form action="">
          <div className="purchaser-input">
            <div className="purchaser-input-wrapper">
              <div className="input">
                <label htmlFor="purchaser-id">Purchaser Id:</label>
                <input
                  type="text"
                  name="purchaser-id"
                  id="purchaser-id"
                  placeholder="111"
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
                <label htmlFor="purchaser-name">Purchaser Name:</label>
                <input
                  type="text"
                  name="purchaser-name"
                  id="purchaser-name"
                  placeholder="John Doe"
                  onChange={(e) => {
                    console.log(e.target.value);
                    setPurchaseData({
                      ...purchaseData,
                      purchaserName: e.target.value,
                    });
                  }}
                  value={purchaseData.purchaserName}
                />
              </div>
              <div className="input">
                <label htmlFor="purchaser-cnic">CNIC No:</label>
                <input
                  type="text"
                  name="purchaser-cnic"
                  id="purchaser-cnic"
                  placeholder="00000-0000000-0"
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

    </div>
  );
}
