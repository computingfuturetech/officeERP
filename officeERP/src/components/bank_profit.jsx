import React, { useEffect, useState, useRef } from "react";
import "./style/memberListStyle.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function BankProfitComponent() {
  const history = useNavigate();
//   const [showSection, setShowSection] = useState(false);
  const [memberList, setMemberList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [page, setPage] = useState(1);
  const [editSection, setEditSection] = useState(false);
  const membersRef = useRef(null);
  const [msNo, setMsNo] = useState("");
  const [purchaseName, setPurchaseName] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [phase, setPhase] = useState("");
  const [plotNo, setPlotNo] = useState("");
  const [block, setBlock] = useState("");
  const [cnicNo, setCnicNo] = useState("");
  const [address, setAddress] = useState("");
  const [addNew, setAddNew] = useState(false);




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

  const handleAddNew = (member) => {
    scrollToTop();
    setSelectedMember(member);
    setAddNew(true);
    setShowOptions(false);
  };
  const handleEditSection = (member) => {
    setSelectedMember(member);
    setMsNo(member.msNo);
    setPurchaseName(member.purchaseName);
    setGuardianName(member.guardianName);
    setPhase(member.phase);
    setPlotNo(member.plotNo);
    setBlock(member.block);
    setCnicNo(member.cnicNo);
    setAddress(member.address);
    setEditSection(true);
    setShowOptions(false);
  };

  const handleShowOptions = (member) => {
    setSelectedMember(member);
    setShowOptions(!showOptions);
  };

  const closeSection = () => {
    setAddNew(false);
    setMsNo("");
    setPurchaseName("");
    setGuardianName("");
    setPhase("");
    setPlotNo("");
    setBlock("");
    setCnicNo("");
    setAddress("");
    setEditSection(false);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const updateMember = (e) => {
    e.preventDefault();

    const data = {
      ms_no: msNo,
      purchase_name: purchaseName,
      guardian: guardianName,
      phase: phase,
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  
  };


  return (
    <div className="member-list">
      <div className="title">
        <h2>BankProfit</h2>
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
          <Link className="blue-button" onClick={handleAddNew}> Add New</Link> 
          <Link className="simple-button" onClick={handleRefresh}>
            Refresh
          </Link>
        </div>
      </div>
      <div className="top-bar">
        <div className="top-bar-item">
          <h4>Bank Name</h4>
          <h4>Account Number</h4>
          <h4>Month</h4>
          <h4>Amount</h4>
          <h4></h4>
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
              <img
                onClick={() => handleShowOptions(member)}
                src="data:image/svg+xml,%3Csvg width='800px' height='800px' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:%23231f20;stroke:null;stroke-linecap:round;stroke-linejoin:round;stroke-width:2px;%7D%3C/style%3E%3C/defs%3E%3Cg id='more'%3E%3Ccircle class='cls-1' cx='16' cy='16' r='2'/%3E%3Ccircle class='cls-1' cx='6' cy='16' r='2'/%3E%3Ccircle class='cls-1' cx='26' cy='16' r='2'/%3E%3C/g%3E%3C/svg%3E"
                alt="Member Icon"
              />
            </div>

            {selectedMember === member && showOptions && (
              <div className="options income">
                {/* <button onClick={() => handleAddNew(member)}>Edit</button>
                {/* <div className="horizontal-divider"></div> */}
                 <button onClick={() => handleEditSection(member)}>Edit</button> 
                <div className="horizontal-divider"></div>
                <button>Delete</button>
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
      {editSection && (
        <div className="left-section">
        <div className="left-section-content">
          <div onClick={closeSection} className="close-button"></div>
          <h3>Add Bank Profit</h3>
          <div className="horizontal-divider"></div>
          <form onSubmit={updateMember}>
            <label htmlFor="msNo">Bank Name: </label>
            {/* <input
              type="text"
              // readOnly
              className="read-only"
              name="msNo"
              id="msNo"
              value={msNo}
              onChange={(e) => setMsNo(e.target.value)}
            /> */}
            <select name="bank-name" id="bank-name">
              <option value="select" hidden>Select</option>
              <option value="1">HBL</option>
              <option value="2">ABL</option>
            </select>
            <label htmlFor="purchaseName">Account Number: </label>
            <select name="account-number" id="account-number">
            <option value="select" hidden>Select</option>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
            <label htmlFor="guardianName">Month: </label>
            <input
              type="date"
              name="guardianName"
              id="guardianName"
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
            />
            <label htmlFor="phase">Amount: </label>
            <input
              type="text"
              name="phase"
              id="phase"
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
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
      {addNew && (
        <div className="left-section">
          <div className="left-section-content">
            <div onClick={closeSection} className="close-button"></div>
            <h3>Add Bank Profit</h3>
            <div className="horizontal-divider"></div>
            <form onSubmit={updateMember}>
              <label htmlFor="msNo">Bank Name: </label>
              {/* <input
                type="text"
                // readOnly
                className="read-only"
                name="msNo"
                id="msNo"
                value={msNo}
                onChange={(e) => setMsNo(e.target.value)}
              /> */}
              <select name="bank-name" id="bank-name">
                <option value="select" hidden>Select</option>
                <option value="1">HBL</option>
                <option value="2">ABL</option>
              </select>
              <label htmlFor="purchaseName">Account Number: </label>
              <select name="account-number" id="account-number">
              <option value="select" hidden>Select</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
              <label htmlFor="guardianName">Month: </label>
              <input
                type="date"
                name="guardianName"
                id="guardianName"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
              />
              <label htmlFor="phase">Amount: </label>
              <input
                type="text"
                name="phase"
                id="phase"
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
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
