import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./style/memberListStyle.css";
import "./style/seller.css";

export default function PossessionComponent() {

  const [memberList, setMemberList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState({
    msNo: "",
    purchaseName: "",
    challanNumber: "",
    date: "",
    possessionFee: "",
    electricityConnectionCharges: "",
    waterConnectionCharges: "",
    masjidFund: "",
    constructionWater: "",
    buildingBylawsCharges: ""
  });
  const [addDues, setAddDues] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const membersRef = useRef(null);

  const fetchMemberList = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user/getSellerPurchaseIncome/?type=Seller`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setMemberList(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchMemberList();
  }, [fetchMemberList]);

  const handleScroll = useCallback(() => {
    if (membersRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = membersRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 50 && !loading) {
        setPage(prevPage => prevPage + 1);
      }
    }
  }, [loading]);

  useEffect(() => {
    const ref = membersRef.current;
    if (ref) {
      ref.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (ref) {
        ref.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDues = () => setAddDues(true);

  const closeSection = () => {
    setAddDues(false);
    setIsLoading(false);
    setFormData({
      msNo: "",
      purchaseName: "",
      challanNumber: "",
      date: "",
      possessionFee: "",
      electricityConnectionCharges: "",
      waterConnectionCharges: "",
      masjidFund: "",
      constructionWater: "",
      buildingBylawsCharges: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data=formData
    console.log(data)
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/user/createPossessionFee`,
        data,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("Added Successfully");
      closeSection();
    } catch (error) {
      toast.error("Error Try Again!");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="member-list">
      <div className="title">
        <h2>Possession Income</h2>
        <div className="title-buttons">
          <button className="blue-button" onClick={handleAddDues}>Add Dues</button>
          <button className="simple-button" onClick={() => window.location.reload()}>Refresh</button>
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
      <div className={`members ${loading ? "loading" : ""}`} ref={membersRef}>
        {memberList.map(member => (
          <div className="member" key={member.id}>
            <div className="member-details">
              <p>{member.memberNo.msNo || "-"}</p>
              <p>{member.memberNo.purchaseName || "-"}</p>
              <p>{member.amount || "-"}</p>
              <p>{member.paidDate ? new Date(member.paidDate).toISOString().split('T')[0] : "-"}</p>
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
          <h3>Add Possession Income</h3>
          <div className="horizontal-divider"></div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="msNo">Membership No:</label>
                <input
                  type="text"
                  id="msNo"
                  name="msNo"
                  value={formData.msNo}
                  onChange={handleChange}
                />
             
                <label htmlFor="purchaseName">Name:</label>
                <input
                  type="text"
                  id="purchaseName"
                  name="purchaseName"
                  value={formData.purchaseName}
                  onChange={handleChange}
                />
           
                <label htmlFor="challanNumber">Challan Number:</label>
                <input
                  type="text"
                  id="challanNumber"
                  name="challanNumber"
                  value={formData.challanNumber}
                  onChange={handleChange}
                />
          
         
                <label htmlFor="date">Date:</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                />
          
           
                <label htmlFor="possessionFee">Possession Fee:</label>
                <input
                  type="text"
                  id="possessionFee"
                  name="possessionFee"
                  value={formData.possessionFee}
                  onChange={handleChange}
                />
   
                <label htmlFor="electricityConnectionCharges">Electricity Connection Charges:</label>
                <input
                  type="text"
                  id="electricityConnectionCharges"
                  name="electricityConnectionCharges"
                  value={formData.electricityConnectionCharges}
                  onChange={handleChange}
                />

                <label htmlFor="waterConnectionCharges">Water Connection Charges:</label>
                <input
                  type="text"
                  id="waterConnectionCharges"
                  name="waterConnectionCharges"
                  value={formData.waterConnectionCharges}
                  onChange={handleChange}
                />

                <label htmlFor="masjidFund">Masjid Fund:</label>
                <input
                  type="text"
                  id="masjidFund"
                  name="masjidFund"
                  value={formData.masjidFund}
                  onChange={handleChange}
                />
     
                <label htmlFor="constructionWater">Construction Water (Water for 6 months):</label>
                <input
                  type="text"
                  id="constructionWater"
                  name="constructionWater"
                  value={formData.constructionWater}
                  onChange={handleChange}
                />
    
                <label htmlFor="buildingBylawsCharges">Building Bylaws Charges:</label>
                <input
                  type="text"
                  id="buildingBylawsCharges"
                  name="buildingBylawsCharges"
                  value={formData.buildingBylawsCharges}
                  onChange={handleChange}
                />
         
              <button type="submit" className="blue-button" disabled={isLoading}>
                {isLoading ? "Processing..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
