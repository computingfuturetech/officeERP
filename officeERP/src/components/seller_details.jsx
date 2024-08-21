import React, { useEffect, useState, useRef } from "react";
import "./style/memberListStyle.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import { showErrorToastMessage, showSuccessToastMessage } from "./toastUtils";
import "./style/seller.css";

export default function SellerDetails() {
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
  const [isLoading, setIsLoading] = useState(false);
  const [ShowButton, setShowButton] = useState(true);
  const [showOptions, setShowOptions] = useState(false);

  const [addDues, setAddDues] = useState(false);
  const [updateMemberState, setUpdateMemberState] = useState([]);
  const [typeOption, setTypeOption] = useState(true);
  const [sellerForm, setSellerForm] = useState(false);
  const [purchaserForm, setPurchaseForm] = useState(false);
  const [purchaseOptions, setPurchaseOptions] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [memberFound, setMemberFound] = useState(false);
  const [addPurchaser, setAddPurchaser] = useState(false);
  const [purchaseData, setPurchaseData] = useState([]);
  const [memberType, setMemberType] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [backAccount, setBankAccount] = useState([]);
  const [showSection, setShowSection] = useState(false);

  const [formData, setFormData] = useState([]);

  const handleBankAccount = async (e) => {
    try {
      const config = {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      };
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user/bankList`,
        config
      );
      console.log("Bank Account", response.data);
      setBankAccount(response.data);
    } catch (error) {
      console.error(error);
      showErrorToastMessage("Error getting Bank Accounts");
    }
  };

  const handleCreatePurchaser = async (e) => {
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

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/createMember`,
        body,
        config
      );
      if (response.status === 200) {
        showSuccessToastMessage("Purchaser Added Successfully");
        setAddDues(true);
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
    } finally {
      closeSection();
      setUpdateMemberState([]);
      setFormData([]);
      setBankAccount([]);
      setMsNo("");
    }
  };
  const handleCnicChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^\d-]/g, "");

    if (value.length === 6 && !value.includes("-")) {
      value = value.slice(0, 5) + "-" + value.slice(5);
    } else if (value.length === 14 && value.split("-").length === 2) {
      value = value.slice(0, 13) + "-" + value.slice(13);
    }

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

  useEffect(() => {
    const setData = async () => {
      const newState = { ...updateMemberState };

      formData.forEach((item) => {
        newState[item._id] = 0;
      });
      setUpdateMemberState(newState);
    };
    setData();
  }, [formData]);

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
        setMemberList(response.data);
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

  const convertDate = (e) => {
    const dateValue = new Date(e).toISOString().split("T")[0];
    return dateValue;
  };

  const closeSection = () => {
    setAddDues(false);
    setShowOptions(false);
    setMsNo("");
    setPurchaseName("");
    setChallanNumber("");
    setPurchaseOptions(false);
    setDate("");
    setPlotNo("");
    setShowButton(true);
    setBlock("");
    setCnicNo("");
    setAddress("");
    setIsLoading(false);
    setTypeOption(true);
    setShowForm(false);
    setSellerForm(false);
    setPurchaseForm(false);
    setShowPurchaseForm(false);
    setAddPurchaser(false);
    setShowSection(false);
  };
  const handleMsNumberChange = (e) => {
    setMsNo(e.target.value);
  };
  const handleRefresh = () => {
    window.location.reload();
  };
  const handleSellerClick = (e) => {
    setMemberType(e);
    setTypeOption(false);
    setSellerForm(true);
    setPurchaseOptions(false);
  };
  const handlePurchaserClick = () => {
    setPurchaseOptions(true);
    setTypeOption(false);
  };

  const clearData = () => {
    setMsNo("");
    setPurchaseName("");
    setChallanNumber("");
    setDate("");
    setPlotNo("");
    setShowButton(true);
    setPurchaseOptions(false);
    setBlock("");
    setIsLoading(false);
    setTypeOption(true);
    setSellerForm(false);
    setShowForm(false);
    setShowPurchaseForm(false);
    setPurchaseForm(false);
    setSellerForm(false);
    setCnicNo("");
    setAddress("");
    closeSection();
  };

  const handleShowOptions = (member) => {
    setSelectedMember(member);
    console.log(member);
    setShowOptions(!showOptions);
  };

  const handleShowSection = (member) => {
    setSelectedMember(member);
    setShowSection(true);
    setShowOptions(false);
  };

  const handleEditSection = (member) => {
    setSelectedMember(member);
    setAddDues(true);
    setShowOptions(false);
  };

  const getMemberData = (e) => {
    setIsLoading(true);
    setMemberFound(true);
    setShowButton(false);
    console.log(msNo);
    const fetchMemeber = async () => {
      try {
        const data = {
          ms_no: msNo,
        };
        const config = {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        };
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/user/getMemberList/?search=${msNo}`,
          config
        );
        console.log(response.data);
        setPurchaseName(response.data[0].purchaseName);
        setUpdateMemberState({
          ...updateMemberState,
          purchaseName: response.data[0].purchaseName,
        });

        setCnicNo(response.data.cnicNo);
        setIsLoading(false);
        console.log(response);
      } catch (error) {
        setMemberFound(false);
        setIsLoading(false);
        showErrorToastMessage("Member Not Found!");
        clearData();
        console.error(error);
      } finally {
        setShowForm(true);
      }
    };
    fetchMemeber();
    getSellerHeadOfAccount(e);
    handleBankAccount();
  };

  const getSellerHeadOfAccount = async () => {
    setIsLoading(true);
    try {
      const config = {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      };
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user/getIncomeHeadOfAccount/?type=${memberType}`,
        config
      );
      setFormData(response.data);
      console.log(response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      console.log(formData);
    }
  };

  const updateMember = (e) => {
    e.preventDefault();
    const {
      purchaseName,
      challan_no,
      date,
      bank_account,
      cheque_no,
      particular,
      paymentType = "Cash",
      ...payment
    } = updateMemberState;
    const data = {
      member_no: msNo,
      challan_no,
      paid_date: new Date(date).toISOString(),
      type: memberType,
      bank_account,
      paymentType,
      cheque_no,
      payment: {
        ...payment,
      },
    };
    console.log(data);

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
        console.log(response);
        closeSection();
        showSuccessToastMessage("Added Successfully");
      } catch (error) {
        console.error(error);
      } finally {
        setUpdateMemberState([]);
        setFormData([]);
        setBankAccount([]);
        setMsNo("");
      }
    };
    update();
  };

  const handleSearch = (e) => {
    debugger;
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
            `${
              process.env.REACT_APP_API_URL
            }/user/getIncomeHeadOfAccount/?id=${searchValue.trim()}`,
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
          <Link className="blue-button" onClick={() => setAddPurchaser(true)}>
            Add Purchaser
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
          const totalAmount =
            (member.transferFee || 0) +
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
                <p>
                  {member.memberNo.msNo === "" ? "-" : member.memberNo.msNo}
                </p>
                <p>
                  {member.memberNo.purchaseName === ""
                    ? "-"
                    : member.memberNo.purchaseName}
                </p>
                <p>{totalAmount}</p>
                <p>
                  {member.paidDate === "" ? "-" : convertDate(member.paidDate)}
                </p>
                {/* <img
                  onClick={() => handleShowOptions(member)}
                  src="data:image/svg+xml,%3Csvg id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 122.88 83.78' style='enable-background:new 0 0 122.88 83.78' xml:space='preserve'%3E%3Cg%3E%3Cpath d='M95.73,10.81c10.53,7.09,19.6,17.37,26.48,29.86l0.67,1.22l-0.67,1.21c-6.88,12.49-15.96,22.77-26.48,29.86 C85.46,79.88,73.8,83.78,61.44,83.78c-12.36,0-24.02-3.9-34.28-10.81C16.62,65.87,7.55,55.59,0.67,43.1L0,41.89l0.67-1.22 c6.88-12.49,15.95-22.77,26.48-29.86C37.42,3.9,49.08,0,61.44,0C73.8,0,85.45,3.9,95.73,10.81L95.73,10.81z M60.79,22.17l4.08,0.39 c-1.45,2.18-2.31,4.82-2.31,7.67c0,7.48,5.86,13.54,13.1,13.54c2.32,0,4.5-0.62,6.39-1.72c0.03,0.47,0.05,0.94,0.05,1.42 c0,11.77-9.54,21.31-21.31,21.31c-11.77,0-21.31-9.54-21.31-21.31C39.48,31.71,49.02,22.17,60.79,22.17L60.79,22.17L60.79,22.17z M109,41.89c-5.5-9.66-12.61-17.6-20.79-23.11c-8.05-5.42-17.15-8.48-26.77-8.48c-9.61,0-18.71,3.06-26.76,8.48 c-8.18,5.51-15.29,13.45-20.8,23.11c5.5,9.66,12.62,17.6,20.8,23.1c8.05,5.42,17.15,8.48,26.76,8.48c9.62,0,18.71-3.06,26.77-8.48 C96.39,59.49,103.5,51.55,109,41.89L109,41.89z'/%3E%3C/g%3E%3C/svg%3E"
                  alt="Details Icon"
                /> */}
                <img
                  onClick={() => handleShowOptions(member)}
                  src="data:image/svg+xml,%3Csvg width='800px' height='800px' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:%23231f20;stroke:null;stroke-linecap:round;stroke-linejoin:round;stroke-width:2px;%7D%3C/style%3E%3C/defs%3E%3Cg id='more'%3E%3Ccircle class='cls-1' cx='16' cy='16' r='2'/%3E%3Ccircle class='cls-1' cx='6' cy='16' r='2'/%3E%3Ccircle class='cls-1' cx='26' cy='16' r='2'/%3E%3C/g%3E%3C/svg%3E"
                  alt="Member Icon"
                />
              </div>
              {selectedMember === member && showOptions && (
                <div className="options">
                  <button onClick={() => handleShowSection(member)}>
                    Show
                  </button>
                  <div className="horizontal-divider"></div>
                  <button onClick={() => handleEditSection(member)}>
                    Edit
                  </button>
                  <div className="horizontal-divider"></div>
                  <button>Delete</button>
                </div>
              )}
            </div>
          );
        })}
        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
          </div>
        )}
      </div>
      {addPurchaser && (
        <div className="left-section">
          <div className="left-section-content">
            <div onClick={closeSection} className="close-button"></div>
            <h3>Add New Purchaser</h3>
            <div className="horizontal-divider"></div>
            <form onSubmit={updateMember}>
              <label htmlFor="purchaser-id" className="required">
                Purchaser Id:
              </label>
              <input
                type="text"
                name="purchaser-id"
                id="purchaser-id"
                placeholder="111"
                required
                onChange={(e) => {
                  setPurchaseData({
                    ...purchaseData,
                    purchaserId: e.target.value,
                  });
                }}
                value={purchaseData.purchaserId}
              />
              <label htmlFor="purchaser-name" className="required">
                Purchaser Name:
              </label>
              <input
                type="text"
                name="purchaser-name"
                id="purchaser-name"
                placeholder="John Doe"
                required
                onChange={(e) => {
                  setPurchaseData({
                    ...purchaseData,
                    purchaserName: e.target.value,
                  });
                }}
                value={purchaseData.purchaserName}
              />
              <label htmlFor="purchaser-cnic" className="required">
                CNIC No:
              </label>
              <input
                type="text"
                name="purchaser-cnic"
                id="purchaser-cnic"
                placeholder="00000-0000000-0"
                required
                onChange={handleCnicChange}
                value={purchaseData.purchaserCnic}
                inputMode="numeric"
                pattern="[0-9]*"
              />
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
              <button
                type="submit"
                className="blue-button"
                onClick={handleCreatePurchaser}
              >
                Save
              </button>
            </form>
          </div>
        </div>
      )}
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
                    <button
                      className="blue-button"
                      onClick={() => handleSellerClick("Seller")}
                    >
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
                    <button
                      className="blue-button"
                      onClick={() => {
                        closeSection();
                        setAddPurchaser(true);
                      }}
                    >
                      New Purchaser
                    </button>
                    <br></br>
                    <button
                      className="blue-button"
                      onClick={() => handleSellerClick("Purchaser")}
                    >
                      Existing Purchaser
                    </button>
                  </div>
                </>
              )}
              {sellerForm && (
                <>
                  <form onSubmit={updateMember}>
                    <label htmlFor="msNo" className="required">
                      Membership No:{" "}
                    </label>
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
                        onClick={(e) => {
                          e.preventDefault();
                          getMemberData();
                        }}
                      >
                        Find
                      </button>
                    )}
                    {showForm && (
                      <>
                        <label htmlFor="purchaseName" className="required">
                          Name:{" "}
                        </label>
                        <input
                          type="text"
                          name="purchaseName"
                          id="purchaseName"
                          required
                          value={purchaseName}
                          onChange={(e) =>
                            setUpdateMemberState({
                              ...updateMemberState,
                              purchaseName: e.target.value,
                            })
                          }
                        />
                        <label htmlFor="challanNumber" className="required">
                          Challan Number:{" "}
                        </label>
                        <input
                          type="number"
                          name="challanNumber"
                          id="challanNumber"
                          value={updateMemberState.challan_no}
                          required
                          onChange={(e) =>
                            setUpdateMemberState({
                              ...updateMemberState,
                              challan_no: e.target.value,
                            })
                          }
                        />
                        <label htmlFor="particular" className="required">
                          Particular:{" "}
                        </label>
                        <input
                          type="text"
                          name="particular"
                          id="particular"
                          value={updateMemberState.particular}
                          required
                          onChange={(e) =>
                            setUpdateMemberState({
                              ...updateMemberState,
                              particular: e.target.value,
                            })
                          }
                        />
                        <label htmlFor="paymentType" className="required">
                          Payment Type:{" "}
                        </label>
                        <select
                          name="paymentType"
                          id="paymentType"
                          onChange={(e) => {
                            setUpdateMemberState({
                              ...updateMemberState,
                              paymentType: e.target.value,
                            });
                            setPaymentType(e.target.value);
                          }}
                        >
                          <option value="Cash">Cash</option>
                          <option value="Bank">Bank</option>
                        </select>

                        {paymentType === "Bank" && (
                          <>
                            <label htmlFor="bankName" className="required">
                              Bank Account:{" "}
                            </label>

                            {backAccount.length > 0 ? (
                              <select
                                name="bankName"
                                id="bankName"
                                value={updateMemberState.bank_account}
                                onChange={(e) => {
                                  setUpdateMemberState({
                                    ...updateMemberState,
                                    bank_account: e.target.value,
                                  });
                                }}
                              >
                                <option value="select" hidden>
                                  Select Bank
                                </option>
                                {backAccount.map((item) => (
                                  <option value={item.accountNo}>
                                    {item.bankName} - {item.accountNo.slice(-4)}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <p>Loading...</p>
                            )}
                            <label htmlFor="chequeNumber" className="required">
                              Cheque Number:{" "}
                            </label>
                            <input
                              type="text"
                              name="chequeNumber"
                              id="chequeNumber"
                              value={updateMemberState.cheque_no}
                              required
                              onChange={(e) =>
                                setUpdateMemberState({
                                  ...updateMemberState,
                                  cheque_no: e.target.value,
                                })
                              }
                            />
                          </>
                        )}

                        <label htmlFor="date" className="required">
                          Date:{" "}
                        </label>
                        <input
                          type="date"
                          name="date"
                          id="date"
                          // value={convertDate(updateMemberState.paidDate)}
                          required
                          onChange={(e) =>
                            setUpdateMemberState({
                              ...updateMemberState,
                              date: e.target.value,
                            })
                          }
                        />
                        {formData.length > 0 ? (
                          <>
                            {formData.map((item) => (
                              <>
                                <label htmlFor={item._id}>
                                  {item.headOfAccount}
                                </label>
                                <input
                                  type="Number"
                                  id={item._id}
                                  value={item.amount}
                                  onChange={(e) => {
                                    const inputValue = e.target.value;
                                    setUpdateMemberState({
                                      ...updateMemberState,
                                      [item._id]:
                                        inputValue === ""
                                          ? 0
                                          : parseInt(e.target.value),
                                    });
                                  }}
                                />
                              </>
                            ))}
                            <button
                              type="submit"
                              className="blue-button"
                              onClick={updateMember}
                            >
                              Save
                            </button>
                          </>
                        ) : (
                          <p>Loading...</p>
                        )}
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

      {showSection && (
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
                <h4>Paid Date:</h4>
                <p>{convertDate(selectedMember?.paidDate) || "-"}</p>
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
