import React, { useEffect, useState, useRef } from "react";
import "./style/memberListStyle.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function SellerDetails() {
  const history = useNavigate();
  const [memberList, setMemberList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const membersRef = useRef(null);
  const [msNo, setMsNo] = useState("");
  const [purchaseName, setPurchaseName] = useState("");
  const [challanNumber, setChallanNumber] = useState("");
  const [date, setDate] = useState("");
  const [plotNo, setPlotNo] = useState("");
  const [block, setBlock] = useState("");
  const [cnicNo, setCnicNo] = useState("");
  const [address, setAddress] = useState("");
  const [editTransferFee, setEditTransferFee] = useState(false);

  const [addDues, setAddDues] = useState(false);
  const [updateMemberState, setUpdateMemberState] = useState([]);

  const handleAddDues = () => {
    setAddDues(true);
    };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const config = {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        };

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/user/getMemberList/?page_no=${page}`,
          config
        );
        if (response.data.length > 0) {
          setMemberList((prevList) => [...prevList, ...response.data]);
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);
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



  const closeSection = () => {
    setAddDues(false);
    setMsNo("");
    setPurchaseName("");
    setChallanNumber("");
    setDate("");
    setPlotNo("");
    setBlock("");
    setCnicNo("");
    setAddress("");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const updateMember = (e) => {
    e.preventDefault();

    const data = {
      ms_no: msNo,
      purchase_name: purchaseName,
      guardian: challanNumber,
      date: date,
      plot_no: plotNo,
      block: block,
      cnic_no: cnicNo,
      address: address,
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

  const handleSearch = (e) => {
    e.preventDefault();
    try {
      const searchValue = e.target[0].value;
      const search = async () => {
        setLoading(true);
        try {
          const config = {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          };
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/user/getMemberList/?search=${searchValue.trim()}`,
            config
          );
          if (response.data.length > 0) {
            setMemberList(response.data);
          }
          setLoading(false);
        } catch (error) {
          console.error(error);
          setLoading(false);
        }
      };
      search();
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };
  return (
    <div className="member-list">
      <div className="title">
        <h2>Member Dues</h2>
        <div className="title-buttons">
          <form className="nosubmit" onSubmit={handleSearch}>
            <input
              className="nosubmit"
              name="search-members"
              id="search-members"
              type="search"
              placeholder="Search..."
            />
          </form>
          <Link className="blue-button" onClick={handleAddDues}>
          Add Dues
          </Link>
          <Link className="simple-button" onClick={handleRefresh}>
            Refresh
          </Link>
        </div>
      </div>
      <div className="top-bar">
        <div className="top-bar-item">
          <h4>Membership No</h4>
          <h4>Name</h4>
          <h4>Amount</h4>
          <h4>Date</h4>
        </div>
      </div>

      <div className={`members  ${loading ? "loading" : ""}`} ref={membersRef}>
        {memberList.map((member) => (
          <div className="member" key={member.id}>
            <div className="member-details">
              <p>{member.msNo === "" ? "-" : member.msNo}</p>
              <p>{member.purchaseName === "" ? "-" : member.purchaseName}</p>
              <p>{member.phase === "" ? "-" : member.phase}</p>
              <p>{member.plotNo === "" ? "-" : member.plotNo}</p>
            
             
            </div>

          
          </div>
        ))}
        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
          </div>
        )}
      </div>
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
                required
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
