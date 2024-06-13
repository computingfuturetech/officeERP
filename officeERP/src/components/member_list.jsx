import React, { useEffect, useState } from "react";
import "./style/memberListStyle.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function MemberList() {
  const history = useNavigate();
  const [memberList, setMemberList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const config = {
          headers: {
            "Authorization": "Bearer " + localStorage.getItem("token"),
          }
        }

        const response = await axios.get("http://192.168.0.189:3001/user/getMemberList/", config);
        setMemberList(response.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleClick = () => {
    console.log("clicked");
    history("/dummy2");
  };

  return (
    
    <div className="member-list">
      <div className="title">
        <h2>Members</h2>
        <Link className="blue-button" to="/members">See All</Link>
      </div>
      <div className="top-bar">
        <div className="top-bar-item">
          <h4>Member ID</h4>
          <h4>Name</h4>
          <h4>Phase</h4>
          <h4>Plot No</h4>
          <h4>Block</h4>
        </div>
      </div>

      <div className={`members  ${loading ? "loading" : ""}`}>
        {memberList.map((member) => (
          <div className="member" key={member.id} onClick={handleClick}>
            <div className="member-details">
              <p>{member.msNo == '' ? '-': member.msNo}</p>
              <p>{member.purchaseName== '' ? '-': member.purchaseName}</p>
              <p>{member.phase== '' ? '-': member.phase}</p>
              <p>{member.plotNo == '' ? '-': member.plotNo}</p>
              <p>{member.block== '' ? '-': member.block}</p>
            </div>
          </div>
        ))}
      {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
}
