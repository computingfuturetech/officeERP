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
  const [selectedMember, setSelectedMember] = useState(null);
  const [editSection, setEditSection] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [memberId,setMemberId]=useState("")
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
        `${process.env.REACT_APP_API_URL}/user/getPossessionFee`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setMemberList(response.data);
      console.log(response)
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
  const handleShowOptions = (member) => {
    setSelectedMember(member);
    setShowOptions(!showOptions);
  };

  const handleAddDues = () => setAddDues(true);

  const closeSection = () => {
    setAddDues(false);
    setEditSection(false)
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
  const convertDate=(e)=>{
    const dateValue = new Date(e).toISOString().split('T')[0];
    return dateValue;
  }
  const handleEditSection = (member) => {
    setSelectedMember(member);
    setFormData({
        msNo: member.memberNo.msNo,
        purchaseName: member.memberNo.purchaseName,
        challanNumber:member.challanNo,
        date: convertDate(member.paidDate),
        possessionFee: "",
        electricityConnectionCharges: "",
        waterConnectionCharges: "",
        masjidFund: "",
        constructionWater: "",
        buildingBylawsCharges: ""
      });
      setMemberId(member.memberNo._id)
    

    setEditSection(true);
    setShowOptions(false);
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data=formData
    console.log(data)
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/user/updatePossessionFee?id=${formData.msNo}`,
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
          <button className="blue-button" onClick={handleAddDues}>Add Fee</button>
          <button className="simple-button" onClick={() => window.location.reload()}>Refresh</button>
        </div>
      </div>
      <div className="top-bar">
        <div className="top-bar-item">
          <h4>Membership No</h4>
          <h4>Name</h4>
          <h4>Amount</h4>
          <h4>Date</h4>
          <h4></h4>
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


        {editSection && (
        <div className="left-section">
        <div className="left-section-content">
          <div onClick={closeSection} className="close-button"></div>
          <h3>Edit Possession Income</h3>
          <div className="horizontal-divider"></div>
            <form onSubmit={handleEditSubmit}>
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
                  disabled
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
                {isLoading ? "Processing..." : "Edit"}
              </button>
            </form>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
