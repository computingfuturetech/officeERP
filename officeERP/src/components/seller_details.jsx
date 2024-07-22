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

  const handleEditTransferFee = () => {
    setEditTransferFee(!editTransferFee);
    };

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
          `http://192.168.0.189:3001/user/getMemberList/?page_no=${page}`,
          config
        );
        if (response.data.length > 0) {
          setMemberList((prevList) => [...prevList, ...response.data]);
        }
        console.log(response.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);
  const handleScroll = () => {
    console.log("scrolling");
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
      console.log(data);
      try {
        const config = {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        };
        const response = await axios.post(
          `http://192.168.0.189:3001/user/updateMember`,
          data,
          config
        );
        console.log(response.data);
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
      console.log(searchValue);
      const search = async () => {
        setLoading(true);
        console.log(searchValue);
        try {
          const config = {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          };
          const response = await axios.get(
            `http://192.168.0.189:3001/user/getMemberList/?search=${searchValue.trim()}`,
            config
          );
          console.log(response.data);
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
          <h4>Member ID</h4>
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
              <label htmlFor="msNo">Member Id: </label>
              <input
                type="text"
                name="msNo"
                id="msNo"
                value={msNo}
                onChange={(e) => setMsNo(e.target.value)}
              />
              <label htmlFor="purchaseName">Name: </label>
              <input
                type="text"
                name="purchaseName"
                id="purchaseName"
                value={purchaseName}
                onChange={(e) =>setPurchaseName(e.target.value)}
              />
              <label htmlFor="challanNumber">Challan Number: </label>
              <input
                type="number"
                name="challanNumber"
                id="challanNumber"
                value={challanNumber}
                onChange={(e) => setChallanNumber(e.target.value)}
              />
              <label htmlFor="date">Date: </label>
              <input
                type="date"
                name="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />

              <label htmlFor="nocFee">NOC Fee: </label>
              <input
                type="number"
                name="nocFee"
                id="nocFee"
                value={plotNo}
                onChange={(e) => setPlotNo(e.target.value)}
              />
              <label htmlFor="masjidFund">Masjid Fund: </label>
              <input
                type="number"
                name="masjidFund"
                id="masjidFund"
                value={plotNo}
                onChange={(e) => setPlotNo(e.target.value)}
              />
              <label htmlFor="dualOwnerFee">Dual Owner Fee: </label>
              <input
                type="number"
                name="dualOwnerFee"
                id="dualOwnerFee"
                value={plotNo}
                onChange={(e) => setPlotNo(e.target.value)}
              />
              <label htmlFor="coveredAreaFee">Covered Area Fee: </label>
              <input
                type="number"
                name="coveredAreaFee"
                id="coveredAreaFee"
                value={plotNo}
                onChange={(e) => setPlotNo(e.target.value)}
              />
              <label htmlFor="shareMoney">Share Money: </label>
              <input
                type="number"
                name="shareMoney"
                id="shareMoney"
                value={plotNo}
                onChange={(e) => setPlotNo(e.target.value)}
              />
              <label htmlFor="depositLandCost">Deposit For Land Cost: </label>
              <input
                type="number"
                name="depositLandCost"
                id="depositLandCost"
                value={plotNo}
                onChange={(e) => setPlotNo(e.target.value)}
              />
              <label htmlFor="depositDevelopmentCharges">Deposit for Development Charges: </label>
              <input
                type="number"
                name="depositDevelopmentCharges"
                id="depositDevelopmentCharges"
                value={plotNo}
                onChange={(e) => setPlotNo(e.target.value)}
              />
              <label htmlFor="additionalCharges">Additional Development Charges: </label>
              <input
                type="number"
                name="additionalCharges"
                id="additionalCharges"
                value={plotNo}
                onChange={(e) => setPlotNo(e.target.value)}
              />
              <label htmlFor="electricityCharges">Electricity Charges: </label>
              <input
                type="number"
                name="electricityCharges"
                id="electricityCharges"
                value={plotNo}
                onChange={(e) => setPlotNo(e.target.value)}
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
