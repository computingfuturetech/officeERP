import React, { useEffect, useState, useRef } from "react";
import "./style/memberListStyle.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import { showErrorToastMessage, showSuccessToastMessage } from "./toastUtils";
import "./style/seller.css";

export default function WaterMaintainanceComponent() {
  const [BankProfitList, setBankProfitList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [page, setPage] = useState(1);
  const [editSection, setEditSection] = useState(false);
  const membersRef = useRef(null);
  const [monthName, setMonthName] = useState("");
  const [amount, setAmount] = useState("");
  const [profit_id, setProfitId] = useState("");
  const [challanNo, setChallanNo] = useState("");
  const [showSection, setShowSection] = useState(false);
  const [memberNo, setMemberNo] = useState("");
  const [memberName, setMemberName] = useState("");
  const [plotNo, setPlotNo] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [billingMonth, setBillingMonth] = useState("");
  const [paidDate, setPaidDate] = useState("");

  const [hasMorePages, setHasMorePages] = useState(true);
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
  const timeoutRef = useRef(0); // Ref to keep track of the timeout

  const [isFetching, setIsFetching] = useState(false);
  const [isPageOneFetched, setIsPageOneFetched] = useState(false); // New state to track if page 1 is fetched

  const fetchData = async () => {
    if (timeoutRef.current === 0) {
      return;
    }
    if (isFetching || !hasMorePages) return;

    // Check if page 1 is already fetched
    if (page === 1 && isPageOneFetched) return;

    setLoading(true);
    setIsFetching(true);

    try {
      const config = {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      };
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user/getWaterMaintenanceBill/?page_no=${page}`,
        config
      );

      console.log(response.data);
      if (response.data.length > 0) {
        setBankProfitList((prevList) => [...prevList, ...response.data]);
        setHasMorePages(response.data.hasMore);
        if (page === 1) {
          setIsPageOneFetched(true);
          console.log("fetched with variable:", isPageOneFetched);
        }
      } else {
        setHasMorePages(false);
      }
    } catch (error) {
      console.error("Error fetching bank profits:", error);
      showErrorToastMessage("An Error Occurred While Fetching Data!");
    } finally {
      setLoading(false);
      setIsFetching(false);
      timeoutRef.current++;
    }
  };
  useEffect(() => {
    timeoutRef.current++;

    fetchData();
  }, [page, hasMorePages]);

  const handleScroll = () => {
    if (membersRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = membersRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 50 && !loading) {
        setPage((prevPage) => prevPage + 1);
      }
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

  const handleEditSection = (member) => {
    scrollToTop();
    setSelectedMember(member);
    setMemberNo(member.memberNo.msNo);
    setMemberName(member.memberNo.purchaseName);
    setPlotNo(member.plotNo);
    setReferenceNo(member.referenceNo);
    setBillingMonth(member.billingMonth);
    setProfitId(member._id);
    setMonthName(member.profitMonth);
    setAmount(member.amount);
    setPaidDate(
      member.paidDate
        ? new Date(member.paidDate).toISOString().split("T")[0]
        : ""
    );
    setChallanNo(member.challanNo);
    setEditSection(true);
    setShowOptions(false);
  };
  const handleShowSection = (member) => {
    console.log(member);
    scrollToTop();
    setSelectedMember(member);
    setMonthName(member.profitMonth);
    setAmount(member.amount);
    setProfitId(member._id);
    setChallanNo(member.challanNo);
    setShowSection(true);

    setEditSection(false);

    setShowOptions(false);
  };

  const handleShowOptions = (member) => {
    setSelectedMember(member);
    setShowOptions(!showOptions);
  };

  const closeSection = () => {
    setMonthName("");
    setAmount("");
    setEditSection(false);
    setChallanNo("");
    setShowSection(false);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const updateBankProfit = (e) => {
    e.preventDefault();
    const data = {
      member_no: memberNo,
      plot_no: plotNo,
      reference_no: referenceNo,
      billing_month: billingMonth,
      paid_date: paidDate,
      amount: amount,
      challan_no: challanNo,
    };

    const update = async () => {
      console.log(data);
      try {
        const config = {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        };
        const response = await axios.post(
          process.env.REACT_APP_API_URL +
            `/user/updateWaterMaintenanceBill?id=${profit_id}`,
          data,
          config
        );
        showSuccessToastMessage("Bank Profit Updated Successfully!");
        fetchData();
        console.log(response.data);
        closeSection();
      } catch (error) {
        showErrorToastMessage("Error Updating");
        console.error(error);
      }
    };
    update();
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  return (
    <>
      <div className="member-list">
        <div className="title">
          <h2>Water Maintenance Bills</h2>
          <div className="title-buttons">
            <Link className="simple-button" onClick={handleRefresh}>
              Refresh
            </Link>
          </div>
        </div>
        <div className="top-bar">
          <div className="top-bar-item">
            <h4>Member No</h4>
            <h4>Member Name</h4>
            <h4>Billing Month</h4>
            <h4>Amount</h4>
            <h4></h4>
          </div>
        </div>

        <div
          className={`members  ${loading ? "loading" : ""}`}
          ref={membersRef}
        >
          {BankProfitList.map((member) => (
            <div className="member bankprofit" key={member._id}>
              <div className="member-details">
                <p>{member.memberNo.msNo}</p>
                <p>{member.memberNo.purchaseName}</p>
                <p>{member.billingMonth}</p>
                <p>{member.amount}</p>
                <img
                  onClick={() => handleShowOptions(member)}
                  src="data:image/svg+xml,%3Csvg width='800px' height='800px' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:%23231f20;stroke:null;stroke-linecap:round;stroke-linejoin:round;stroke-width:2px;%7D%3C/style%3E%3C/defs%3E%3Cg id='more'%3E%3Ccircle class='cls-1' cx='16' cy='16' r='2'/%3E%3Ccircle class='cls-1' cx='6' cy='16' r='2'/%3E%3Ccircle class='cls-1' cx='26' cy='16' r='2'/%3E%3C/g%3E%3C/svg%3E"
                  alt="Member Icon"
                />
              </div>
              {selectedMember === member && showOptions && (
                <div className="options custom-option">
                  <button onClick={() => handleShowSection(member)}>
                    Show
                  </button>
                  <div className="horizontal-divider"></div>
                  <button onClick={() => handleEditSection(member)}>
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
            </div>
          )}
        </div>

        {showSection && (
          <div className="left-section">
            <div className="left-section-content">
              <div onClick={closeSection} className="close-button"></div>
              <h3>Bank Profit</h3>
              <div className="horizontal-divider"></div>
              <div className="details">
                <div className="details-item">
                  <h4>Member No:</h4>
                  <p>{selectedMember.memberNo.msNo}</p>
                </div>
                <div className="details-item">
                  <h4>Member Name</h4>
                  <p>{selectedMember.memberNo.purchaseName}</p>
                </div>
                <div className="details-item">
                  <h4>Plot No:</h4>
                  <p>{selectedMember.plotNo}</p>
                </div>
                <div className="details-item">
                  <h4>Challan No:</h4>
                  <p>{selectedMember.challanNo}</p>
                </div>
                <div className="details-item">
                  <h4>Reference No:</h4>
                  <p>{selectedMember.referenceNo}</p>
                </div>
                <div className="details-item">
                  <h4>Billing Month:</h4>
                  <p>{selectedMember.billingMonth}</p>
                </div>

                <div className="details-item">
                  <h4>Paid Date:</h4>
                  <p>{formatDate(selectedMember.paidDate)}</p>
                </div>
                <div className="details-item">
                  <h4>Amount:</h4>
                  <p>{amount}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {editSection && (
          <div className="left-section">
            <div className="left-section-content">
              <div onClick={closeSection} className="close-button"></div>
              <h3>Edit Bill</h3>
              <div className="horizontal-divider"></div>
              <form onSubmit={updateBankProfit}>
                <label htmlFor="msNo">Member No: </label>
                <input
                  type="text"
                  name="msNo"
                  id="msNo"
                  value={memberNo}
                  readOnly
                  className="read-only"
                  onChange={(e) => {
                    setMemberNo(e.target.value);
                  }}
                />
                <label htmlFor="memberName">Member Name: </label>
                <input
                  type="text"
                  name="memberName"
                  readOnly
                  className="read-only"
                  id="memberName"
                  value={memberName}
                  onChange={(e) => {
                    setMemberName(e.target.value);
                  }}
                />
                <label htmlFor="challanNo">Challan No: </label>
                <input
                  type="text"
                  name="challanNo"
                  id="challanNo"
                  value={challanNo}
                  onChange={(e) => {
                    setChallanNo(e.target.value);
                  }}
                />
                <label htmlFor="plotNo">Plot No: </label>
                <input
                  type="text"
                  name="plotNo"
                  id="plotNo"
                  readOnly
                  className="read-only"
                  value={plotNo}
                  onChange={(e) => {
                    setPlotNo(e.target.value);
                  }}
                />
                <label htmlFor="referenceNo">Reference No: </label>
                <input
                  type="text"
                  name="referenceNo"
                  id="referenceNo"
                  readOnly
                  className="read-only"
                  value={referenceNo}
                  onChange={(e) => {
                    setReferenceNo(e.target.value);
                  }}
                />
                <label htmlFor="billingMonth">Billing Month: </label>
                <select
                  name="billingMonth"
                  id="billingMonth"
                  readOnly
                  className="read-only"
                  value={billingMonth}
                  onChange={(e) => setBillingMonth(e.target.value)}
                >
                  <option value={billingMonth}>{billingMonth}</option>
                </select>
                {/* <input
                  type="month"
                  name="billingMonth"
                  id={`billingMonth`}
                  required
                  onChange={(e) => setBillingMonth(e.target.value)}
                  value={billingMonth}
                /> */}
                <label htmlFor="paidDate">Paid Date: </label>
                <input
                  type="date"
                  name="paidDate"
                  id={`paidDate`}
                  required
                  readOnly
                  className="read-only"
                  onChange={(e) => setPaidDate(e.target.value)}
                  value={paidDate}
                />
                <label htmlFor="amount">Amount: </label>
                <input
                  type="text"
                  name="amount"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <button
                  type="submit"
                  className="blue-button"
                  onClick={updateBankProfit}
                >
                  Save
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
