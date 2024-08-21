import React, { useEffect, useState, useRef } from "react";
import "./style/memberListStyle.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import { showErrorToastMessage, showSuccessToastMessage } from "./toastUtils";
import "./style/seller.css";

export default function SellerDetails() {
  const history = useNavigate();
  const [memberList, setMemberList] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
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
  const [isLoading,setIsLoading]=useState(false)
  const [ShowButton,setShowButton]=useState(true)
  const [showOptions, setShowOptions] = useState(false);


  const [addDues, setAddDues] = useState(false);
  const [updateMemberState, setUpdateMemberState] = useState([]);
  const [typeOption,setTypeOption]=useState(true)
  const [sellerForm,setSellerForm]=useState(false)
  const [purchaserForm,setPurchaseForm]=useState(false)
  const [purchaseOptions,setPurchaseOptions]=useState(false)
  const [showForm,setShowForm]=useState(false)
  const [showPurchaseForm,setShowPurchaseForm]=useState(false)
  const [memberFound,setMemberFound]=useState(false)

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
          `${process.env.REACT_APP_API_URL}/user/getSellerPurchaseIncome/?type=Seller`,
          config
        );
        // if (response.data.length > 0) {
        //   setMemberList((prevList) => [...prevList, ...response.data]);
        // }
        setMemberList(response.data)
        console.log(response.data)
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

  const convertDate=(e)=>{
    const dateValue = new Date(e).toISOString().split('T')[0];
    return dateValue;
  }

  const closeSection = () => {
    setAddDues(false);
    setShowOptions(false)
    setMsNo("");
    setPurchaseName("");
    setChallanNumber("");
    setPurchaseOptions(false)
    setDate("");
    setPlotNo("");
    setShowButton(true)
    setBlock("");
    setCnicNo("");
    setAddress("");
    setIsLoading(false)
    setTypeOption(true)
    setShowForm(false)
    setSellerForm(false)
    setPurchaseForm(false)
    setShowPurchaseForm(false)
  };
  const handleMsNumberChange=(e)=>{
    setMsNo(e.target.value)
  }
  const handleExistingPurchaserClick=()=>{
    setPurchaseForm(true)
    setPurchaseOptions(false)
  }
  const handleRefresh = () => {
    window.location.reload();
  };
  const handleSellerClick=()=>{
    setTypeOption(false)
    setSellerForm(true)
  }
  const handlePurchaserClick=()=>{
    setPurchaseOptions(true)
    setTypeOption(false)
  }

  const clearData=()=>{
    setMsNo("");
    setPurchaseName("");
    setChallanNumber("");
    setDate("");
    setPlotNo("");
    setShowButton(true)
    setPurchaseOptions(false)
    setBlock("");
    setIsLoading(false)
    setTypeOption(true)
    setSellerForm(false)
    setShowForm(false)
    setShowPurchaseForm(false)
    setPurchaseForm(false)
    setSellerForm(false)
    setCnicNo("");
    setAddress("");
    closeSection()

  }

 
  const handleShowOptions=(member)=>{
    setSelectedMember(member);
    console.log(member)
    setShowOptions(!showOptions);
  }
  const getMemberData=(e)=>{
    e.preventDefault();
    setIsLoading(true)
    setMemberFound(true)
    setShowButton(false)
    console.log(msNo)
    const fetchMemeber = async () => {
      try {
        const data={
          ms_no:msNo
        }
        const config = {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        };
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/user/getMemberList/?search=${msNo}`,
          config
        );
        setPurchaseName(response.data[0].purchaseName)
        setUpdateMemberState({
          ...updateMemberState,
          purchaseName:response.data[0].purchaseName
        })

        setCnicNo(response.data.cnicNo)
        console.log(response)
      } catch (error) {
        setMemberFound(false)
        showErrorToastMessage("Member Not Found!")
        clearData()
        console.error(error);
      }
    };
    fetchMemeber();

    
    const fetchMemeberData = async () => {
      try {
        const config = {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        };
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/user/getSellerPurchaseIncome?member_no=${msNo}`,
          config
        );
        setUpdateMemberState({
          ...updateMemberState,
          dualOwnerFee: e.target.value
        })
        setShowForm(true)
        setShowPurchaseForm(true)
        response.data.forEach(item => {
          setUpdateMemberState(prevState => ({
                  ...prevState,
                  dualOwnerFee: item.dualOwnerFee
                }));
          setUpdateMemberState(prevState => ({
                  ...prevState,
                  challanNumber: item.challanNo
                }));
         setUpdateMemberState(prevState => ({
                  ...prevState,
                  paidDate:convertDate( item.paidDate)
                }));
          setUpdateMemberState(prevState => ({
                        ...prevState,
                        nocFee: item.nocFee
                      }));
          setUpdateMemberState(prevState => ({
                      ...prevState,
                      masjidFund: item.masjidFund
              }));
          setUpdateMemberState(prevState => ({
                      ...prevState,
                      coveredAreaFee: item.coveredAreaFee
                    }));
          setUpdateMemberState(prevState => ({
                           ...prevState,
                            shareMoney: item.shareMoney
                          }));         
          setUpdateMemberState(prevState => ({
                             ...prevState,
                            depositLandCost: item.depositForLandCost
                            }));
          setUpdateMemberState(prevState => ({
                          ...prevState,
                             depositDevelopmentCharges: item.depositForDevelopmentCharges
                            }));     
          setUpdateMemberState(prevState => ({
                        ...prevState,
                         additionalCharges: item.additionalDevelopmentCharges
                           }));
          setUpdateMemberState(prevState => ({
                         ...prevState,
                         electricityCharges: item.electricityCharges
                         }));
        });
        console.log(response)
        setIsLoading(false)
      } catch (error) {
      clearData()
        console.error(error);
      }
    };
    fetchMemeberData();
  }

  const updateMember = (e) => {
    e.preventDefault();

    const data = {
      member_no: msNo,
      challan_no:updateMemberState.challanNumber || "",
      paid_date:updateMemberState.date || "",
      type:"Seller",
      electricity_charges: updateMemberState.electricityCharges || "",
      noc_fee: updateMemberState.nocFee || "",
      masjid_fund: updateMemberState.masjidFund || "",
      dual_owner_fee: updateMemberState.dualOwnerFee || "",
      covered_area_fee: updateMemberState.coveredAreaFee || "",
      share_money: updateMemberState.shareMoney || "",
      deposit_land_cost: updateMemberState.depositLandCost || "",
      deposit_development_charges: updateMemberState.depositDevelopmentCharges || "",
      additional_charges: updateMemberState.additionalCharges || ""
    };
    console.log(data)
    
    const update = async () => {
      try {
        const config = {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        };
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/user/createSellerPurchaseIncome`,
          data,
          config
        );
        console.log(response)
        closeSection();
        showSuccessToastMessage("Added Successfully")
      } catch (error) {
        console.error(error);
      }
    };
    update();
  };


  const updatePurchaserMember = (e) => {
    e.preventDefault();

    const data = {
      member_no: msNo,
      transfer_fee: updateMemberState.transferFee || "",
      challan_no:updateMemberState.challanNumber || "",
      paid_date:updateMemberState.date || "",
      type:"Purchaser",
      membershipFee: updateMemberState.membershipFee || "",
      admissionFee: updateMemberState.admissionFee || "",
      masjidFund: updateMemberState.masjidFund || "",
      preferenceFee: updateMemberState.preferenceFee || "",
    };

    console.log(data)
    
    const update = async () => {
      try {
        const config = {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        };
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/user/createSellerPurchaseIncome`,
          data,
          config
        );
        closeSection();
        showSuccessToastMessage("Added Successfully")
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
        <h2>Transfer Income</h2>
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
    <h4>Total Amount</h4>
    <h4>Date</h4>
    <h4></h4>
  </div>
</div>

    <div className={`members ${loading ? "loading" : ""}`} ref={membersRef}>
      {memberList.map((member) => {
        const totalAmount = (member.transferFee || 0) +
                            (member.membershipFee || 0) +
                            (member.admissionFee || 0) +
                            (member.masjidFund || 0) +
                            (member.nocFee || 0) +
                            (member.dualOwnerFee || 0) +
                            (member.coveredAreaFee || 0) +
                            (member.shareMoney || 0) +
                            (member.depositForLandCost || 0) +
                            (member.electricityCharges || 0) +
                            (member.additionalCharges || 0) +
                            (member.depositForDevelopmentCharges || 0);

        return (
          <div className="member" key={member.id}>
            <div className="member-details">
              <p>{member.memberNo.msNo === "" ? "-" : member.memberNo.msNo}</p>
              <p>{member.memberNo.purchaseName === "" ? "-" : member.memberNo.purchaseName}</p>
              <p>{totalAmount}</p>
              <p>{member.paidDate === "" ? "-" : convertDate(member.paidDate)}</p>
              <img
                onClick={() => handleShowOptions(member)}
                src="data:image/svg+xml,%3Csvg id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 122.88 83.78' style='enable-background:new 0 0 122.88 83.78' xml:space='preserve'%3E%3Cg%3E%3Cpath d='M95.73,10.81c10.53,7.09,19.6,17.37,26.48,29.86l0.67,1.22l-0.67,1.21c-6.88,12.49-15.96,22.77-26.48,29.86 C85.46,79.88,73.8,83.78,61.44,83.78c-12.36,0-24.02-3.9-34.28-10.81C16.62,65.87,7.55,55.59,0.67,43.1L0,41.89l0.67-1.22 c6.88-12.49,15.95-22.77,26.48-29.86C37.42,3.9,49.08,0,61.44,0C73.8,0,85.45,3.9,95.73,10.81L95.73,10.81z M60.79,22.17l4.08,0.39 c-1.45,2.18-2.31,4.82-2.31,7.67c0,7.48,5.86,13.54,13.1,13.54c2.32,0,4.5-0.62,6.39-1.72c0.03,0.47,0.05,0.94,0.05,1.42 c0,11.77-9.54,21.31-21.31,21.31c-11.77,0-21.31-9.54-21.31-21.31C39.48,31.71,49.02,22.17,60.79,22.17L60.79,22.17L60.79,22.17z M109,41.89c-5.5-9.66-12.61-17.6-20.79-23.11c-8.05-5.42-17.15-8.48-26.77-8.48c-9.61,0-18.71,3.06-26.76,8.48 c-8.18,5.51-15.29,13.45-20.8,23.11c5.5,9.66,12.62,17.6,20.8,23.1c8.05,5.42,17.15,8.48,26.76,8.48c9.62,0,18.71-3.06,26.77-8.48 C96.39,59.49,103.5,51.55,109,41.89L109,41.89z'/%3E%3C/g%3E%3C/svg%3E"
                alt="Details Icon"
              />
            </div>
          </div>
        );
      })}
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
        </div>
      )}
    </div>

      {addDues && (
        <>
        <div className="left-section">
          <div className="left-section-content">
            <div onClick={closeSection} className="close-button"></div>
            <h3>Add Member Dues</h3>
            <div className="horizontal-divider"></div>
        {typeOption && (
          
         <>
        
            <div className="action-buttons">
        <button className="blue-button" onClick={() => handleSellerClick("Seller")}>
          Seller
        </button>
        <button
          className="blue-button"
          onClick={() => handlePurchaserClick("Purchaser")}
        >
          Purchaser
        </button>
      </div> 
          
          
        </>
      )}
       {purchaseOptions && (
          
          <>
         
             <div className="action-buttons">
              <Link to="/income/purchaser">
         <button className="blue-button">
           New Purchaser
         </button>
         </Link>
         <br></br>
         <button
           className="blue-button"
           onClick={() => handleExistingPurchaserClick("Purchaser")}
         >
           Existing Purchaser
         </button>
       </div> 
           
           
         </>
       )}
      {sellerForm && (
            <>
            <form onSubmit={updateMember}>
              <label htmlFor="msNo" className="required">Membership No: </label>
              <input
                type="text"
                name="msNo"
                id="msNo"
                required
                onChange={handleMsNumberChange}
              />
              {ShowButton && (
              <button
                type="submit"
                className="blue-button"
                onClick={getMemberData}
              >
                Find
              </button>
              )}
              {showForm && (
                <>
              <label htmlFor="purchaseName" className="required">Name: </label>
              <input
                type="text"
                name="purchaseName"
                id="purchaseName"
                required
                value={purchaseName}
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
                value={updateMemberState.challanNumber}
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
                value={convertDate(updateMemberState.paidDate)}
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
                value={updateMemberState.nocFee}
                id="nocFee"
                onChange={(e) => setUpdateMemberState({
                  ...updateMemberState,
                  nocFee: e.target.value
                })}
              />
              <label htmlFor="masjidFund">Masjid Fund: </label>
              <input
                type="number"
                value={updateMemberState.masjidFund}
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
                value={updateMemberState.dualOwnerFee}
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
                value={updateMemberState.coveredAreaFee}
                onChange={(e) => setUpdateMemberState({
                  ...updateMemberState,
                  coveredAreaFee: e.target.value
                })}
              />
              <label htmlFor="shareMoney">Share Money: </label>
              <input
                type="number"
                name="shareMoney"
                value={updateMemberState.shareMoney}
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
                value={updateMemberState.depositLandCost}
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
                value={updateMemberState.depositDevelopmentCharges}
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
                value={updateMemberState.additionalCharges}
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
                value={updateMemberState.electricityCharges}
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
              </>
            )}
             
              {isLoading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
          </div>
        )}
            </form>
            </>
            )}

      {purchaserForm && (
            <>
            <form onSubmit={updateMember}>
              <label htmlFor="msNo" className="required">Membership No: </label>
              <input
                type="text"
                name="msNo"
                id="msNo"
                required
                onChange={handleMsNumberChange}
              />
              {ShowButton && (
              <button
                type="submit"
                className="blue-button"
                onClick={getMemberData}
              >
                Find
              </button>
              )}
              {showPurchaseForm && (
                <>
              <label htmlFor="purchaseName" className="required">Name: </label>
              <input
                type="text"
                name="purchaseName"
                id="purchaseName"
                required
                value={purchaseName}
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

              <label htmlFor="transferFee">Transfer Fee: </label>
              <input
                type="number"
                name="transferFee"
                value={updateMemberState.transferFee}
                id="transferFee"
                onChange={(e) => setUpdateMemberState({
                  ...updateMemberState,
                  transferFee: e.target.value
                })}
              />
              <label htmlFor="masjidFund">Masjid Fund: </label>
              <input
                type="number"
                name="masjidFund"
                id="masjidFund"
                value={updateMemberState.masjidFund}
                onChange={(e) => setUpdateMemberState({
                  ...updateMemberState,
                  masjidFund: e.target.value
                })}
              />
              <label htmlFor="membershipFee">Membership Fee: </label>
              <input
                type="number"
                name="membershipFee"
                id="membershipFee"
                value={updateMemberState.membershipFee}
                onChange={(e) => setUpdateMemberState({
                  ...updateMemberState,
                  membershipFee: e.target.value
                })}
              />
               <label htmlFor="membershipFee">Preference Fee: </label>
              <input
                type="number"
                name="preferenceFee"
                id="preferenceFee"
                value={updateMemberState.preferenceFee}
                onChange={(e) => setUpdateMemberState({
                  ...updateMemberState,
                  preferenceFee: e.target.value
                })}
              />
              <button
                type="submit"
                className="blue-button"
                onClick={updatePurchaserMember}
              >
                Save
              </button>
              </>
            )}
              
              {isLoading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
          </div>
        )}
            </form>
            </>
            )}
            </div>
            </div>
      </>
    )}
    {showOptions && (
        <div className="left-section">
        <div className="left-section-content">
          <div onClick={closeSection} className="close-button"></div>
          <h3>Member Fees Details</h3>
          <div className="horizontal-divider"></div>
          <div className="details">
            <div className="details-item">
              <h4>Membership No:</h4>
              <p>{selectedMember?.memberNo.msNo || "-"}</p>
            </div>
            <div className="details-item">
              <h4>Name:</h4>
              <p>{selectedMember?.memberNo.purchaseName || "-"}</p>
            </div>
            <div className="details-item">
              <h4>Transfer Fee:</h4>
              <p>{selectedMember?.transferFee || "-"}</p>
            </div>
            <div className="details-item">
              <h4>Membership Fee:</h4>
              <p>{selectedMember?.membershipFee || "-"}</p>
            </div>
            <div className="details-item">
              <h4>Admission Fee:</h4>
              <p>{selectedMember?.admissionFee || "-"}</p>
            </div>
            <div className="details-item">
              <h4>Masjid Fund:</h4>
              <p>{selectedMember?.masjidFund || "-"}</p>
            </div>
            <div className="details-item">
              <h4>NOC Fee:</h4>
              <p>{selectedMember?.nocFee || "-"}</p>
            </div>
            <div className="details-item">
              <h4>Dual Owner Fee:</h4>
              <p>{selectedMember?.dualOwnerFee || "-"}</p>
            </div>
            <div className="details-item">
              <h4>Covered Area Fee:</h4>
              <p>{selectedMember?.coveredAreaFee || "-"}</p>
            </div>
            <div className="details-item">
              <h4>Share Money:</h4>
              <p>{selectedMember?.shareMoney || "-"}</p>
            </div>
            <div className="details-item">
              <h4>Deposit for Land Cost:</h4>
              <p>{selectedMember?.depositForLandCost || "-"}</p>
            </div>
            <div className="details-item">
              <h4>Electricity Charges:</h4>
              <p>{selectedMember?.electricityCharges || "-"}</p>
            </div>
            <div className="details-item">
              <h4>Additional Development Charges:</h4>
              <p>{selectedMember?.additionalCharges || "-"}</p>
            </div>
            <div className="details-item">
              <h4>Deposit for Development Charges:</h4>
              <p>{selectedMember?.depositForDevelopmentCharges || "-"}</p>
            </div>
          </div>
        </div>
      </div>
      
      )}
     <ToastContainer />      
    </div>

  );
}
