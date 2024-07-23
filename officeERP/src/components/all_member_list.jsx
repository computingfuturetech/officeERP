import React, { useEffect, useState, useRef } from "react";
import "./style/memberListStyle.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AllMemberList() {
  const history = useNavigate();
  const [showSection, setShowSection] = useState(false);
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

  const handleShowSection = (member) => {
    setSelectedMember(member);
    setShowSection(true);
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
    setShowSection(false);
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
        <h2>Members</h2>
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
          <Link className="simple-button" onClick={handleRefresh}>
            Refresh
          </Link>
        </div>
      </div>
      <div className="top-bar">
        <div className="top-bar-item">
          <h4>Membership No</h4>
          <h4>Name</h4>
          <h4>Phase</h4>
          <h4>Plot No</h4>
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
              <div className="options">
                <button onClick={() => handleShowSection(member)}>Show</button>
                <div className="horizontal-divider"></div>
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
            <h3>Edit Member Details</h3>
            <div className="horizontal-divider"></div>
            <form onSubmit={updateMember}>
              <label htmlFor="msNo">Membership No: </label>
              <input
                type="text"
                readOnly
                className="read-only"
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
              <label htmlFor="guardianName">Guardian: </label>
              <input
                type="text"
                name="guardianName"
                id="guardianName"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
              />
              <label htmlFor="phase">Phase: </label>
              <input
                type="text"
                name="phase"
                id="phase"
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
              />
              <label htmlFor="plotNo">Plot No: </label>
              <input
                type="text"
                name="plotNo"
                id="plotNo"
                value={plotNo}
                onChange={(e) => setPlotNo(e.target.value)}
              />
              <label htmlFor="block">Block: </label>
              <input
                type="text"
                name="block"
                id="block"
                value={block}
                onChange={(e) => setBlock(e.target.value)}
              />
              <label htmlFor="cnicNo">CNIC No: </label>
              <input
                type="text"
                name="cnicNo"
                id="cnicNo"
                value={cnicNo}
                onChange={(e) => setCnicNo(e.target.value)}
              />
              <label htmlFor="address">Address: </label>
              <input
                type="text"
                name="address"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
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
      {showSection && (
        <div className="left-section">
          <div className="left-section-content">
            <div onClick={closeSection} className="close-button"></div>
            <h3>Member Details</h3>
            <div className="horizontal-divider"></div>
            <div className="details">
              <div className="details-item">
                <h4>Membership No:</h4>
                <p>{selectedMember?.msNo}</p>
              </div>
              <div className="details-item">
                <h4>Name:</h4>
                <p>{selectedMember?.purchaseName}</p>
              </div>
              <div className="details-item">
                <h4>Guardian:</h4>
                <p>{selectedMember?.guardianName}</p>
              </div>
              <div className="details-item">
                <h4>Phase:</h4>
                <p>{selectedMember?.phase}</p>
              </div>
              <div className="details-item">
                <h4>Plot No:</h4>
                <p>{selectedMember?.plotNo}</p>
              </div>
              <div className="details-item">
                <h4>Block:</h4>
                <p>{selectedMember?.block}</p>
              </div>
              <div className="details-item">
                <h4>CNIC No:</h4>
                <p>{selectedMember?.cnicNo}</p>
              </div>
              <div className="details-item">
                <h4>Address:</h4>
                <p>{selectedMember?.address}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
