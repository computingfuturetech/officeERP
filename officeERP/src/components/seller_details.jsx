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
  const [addPurchaser, setAddPurchaser] = useState(false);
  const [purchaseData, setPurchaseData] = useState([]);
  const [memberType, setMemberType] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [backAccount, setBankAccount] = useState([]);
  const [showSection, setShowSection] = useState(false);
  const [editSection, setEditSection] = useState(false);
  const [filter, setFilter] = useState("");

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
      console.error(error);
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

  const handleAddDues = () => {
    setAddDues(true);
    setShowOptions(false);
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
          `${process.env.REACT_APP_API_URL}/user/getSellerPurchaseIncome/`,
          config
        );
        // if (response.data.length > 0) {
        //   setMemberList((prevList) => [...prevList, ...response.data]);
        // }
        setMemberList(response.data);
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
    if (addDues) setAddDues(false);
    if (showOptions) setShowOptions(false);
    if (showSection) setShowSection(false);
    if (editSection) setEditSection(false);
    if (addPurchaser) setAddPurchaser(false);
    if (sellerForm) setSellerForm(false);
    if (showPurchaseForm) setShowPurchaseForm(false);
    if (showForm) setShowForm(false);
    if (purchaseOptions) setPurchaseOptions(false);
    if (msNo) setMsNo("");
    if (purchaseName) setPurchaseName("");
    if (challanNumber) setChallanNumber("");
    if (date) setDate("");
    if (plotNo) setPlotNo("");
    if (block) setBlock("");
    if (cnicNo) setCnicNo("");
    if (address) setAddress("");
    if (isLoading) setIsLoading(false);
    if (!typeOption) setTypeOption(true);
    if (updateMemberState) setUpdateMemberState([]);
    if (!ShowButton) setShowButton(true);
    if (purchaserForm) setPurchaseForm(false);
    if (formData) setFormData([]);
    if (backAccount) setBankAccount([]);
    if (paymentType) setPaymentType("");
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

  const handleShowOptions = (member) => {
    setSelectedMember(member);
    setShowOptions(!showOptions);
  };

  const handleShowSection = (member) => {
    setSelectedMember(member);
    setShowSection(true);
    setShowOptions(false);
  };

  const handleEditSection = (member) => {
    setUpdateMemberState(member);
    setEditSection(true);
    setSelectedMember(member);
    setShowOptions(false);
  };

  const getMemberData = (e) => {
    setIsLoading(true);
    setShowButton(false);
    const fetchMemeber = async () => {
      try {
        const data = {
          ms_no: msNo,
        };
        if (msNo === "") {
          showErrorToastMessage("Please Enter Membership No");
          setShowButton(true);
          setIsLoading(false);
          return;
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
        setPurchaseName(response.data[0].purchaseName);
        setUpdateMemberState({
          ...updateMemberState,
          purchaseName: response.data[0].purchaseName,
        });

        setCnicNo(response.data.cnicNo);
        setIsLoading(false);
        setShowForm(true);
      } catch (error) {
        setIsLoading(false);
        setShowButton(true);
        showErrorToastMessage("Member Not Found!");
        console.error(error);
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
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
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
      particular,
      cheque_no,
      payment: {
        ...payment,
      },
    };

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
  const editMember = (e) => {
    e.preventDefault();

    console.log(updateMemberState);
    const {
      challanNo,
      date,
      bank_account,
      cheque_no,
      particular,
      paymentType = "Cash",

      memberNo,

      ...paymentDetails
    } = updateMemberState;
    const data = {
      particular,
      challanNo,
      memberNo,
      ...paymentDetails,
    };

    const update = async () => {
      try {
        const config = {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        };
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/user/updateSellerPurchaseIncome?id=${updateMemberState._id}`,
          data,
          config
        );
        console.log(response.data);
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
            `${process.env.REACT_APP_API_URL}/user/getSellerPurchaseIncome?search=${searchValue}`,
            config
          );
          setMemberList(response.data);
          setLoading(false);
        } catch (error) {
          console.error(error);
          setMemberList([]);
          setLoading(false);
        }
      };
      search();
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };
  const handleFilter = (e) => {
    try {
      closeSection();
      const search = async () => {
        setLoading(true);
        try {
          const config = {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          };

          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/user/getSellerPurchaseIncome?type=${filter}`,
            config
          );
          setMemberList(response.data);
          setLoading(false);
        } catch (error) {
          console.error(error);
          setMemberList([]);
          setLoading(false);
        }
      };
      search();
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFilter();
  }, [filter]);

  const calculateTotalPayment = (paymentDetail) => {
    return Object.values(paymentDetail).reduce(
      (total, amount) => total + amount,
      0
    );
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
              placeholder="Search by Membership No"
            />
          </form>
          <select
            className="filter-button"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="Seller">Seller</option>
            <option value="Purchaser">Purchaser</option>
          </select>
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
        {memberList.length > 0 ? (
          memberList.map((member) => {
            const totalAmount = calculateTotalPayment(member.paymentDetail);

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
                    {member.paidDate === ""
                      ? "-"
                      : convertDate(member.paidDate)}
                  </p>

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
                    {/* <div className="horizontal-divider"></div>
                  <button>Delete</button> */}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: "center" }}>No Data Found</p>
        )}
        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
          </div>
        )}
      </div>
      {editSection &&
        (console.log(updateMemberState),
        (
          <div className="left-section">
            <div className="left-section-content">
              <div onClick={closeSection} className="close-button"></div>
              <h3>Add New Purchaser</h3>
              <div className="horizontal-divider"></div>
              <form onSubmit={editMember}>
                <label htmlFor="msNo" className="required">
                  Membership No:{" "}
                </label>
                <input
                  type="text"
                  name="msNo"
                  id="msNo"
                  required
                  readOnly
                  value={updateMemberState.memberNo.msNo}
                />

                <>
                  <label htmlFor="purchaseName" className="required">
                    Name:{" "}
                  </label>
                  <input
                    type="text"
                    name="purchaseName"
                    id="purchaseName"
                    required
                    readOnly
                    value={updateMemberState.memberNo.purchaseName}
                  />
                  <label htmlFor="challanNumber" className="required">
                    Challan Number:{" "}
                  </label>
                  <input
                    type="number"
                    name="challanNumber"
                    id="challanNumber"
                    value={updateMemberState.challanNo}
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
                    value={updateMemberState.check}
                    onChange={(e) => {
                      setUpdateMemberState({
                        ...updateMemberState,
                        paymentType: e.target.value,
                      });
                      setPaymentType(e.target.value);
                    }}
                  >
                    <option value={updateMemberState.check}>
                      {updateMemberState.check}
                    </option>
                  </select>

                  {updateMemberState.check === "Bank" && (
                    <>
                      <label htmlFor="bankName" className="required">
                        Bank Account:{" "}
                      </label>

                      {Object.keys(updateMemberState.check).length > 0 ? (
                        <select
                          name="bankName"
                          id="bankName"
                          value={updateMemberState.bankAccount}
                          readOnly
                        >
                          <option value={updateMemberState.bankAccount}>
                            {updateMemberState.bankAccount}
                          </option>
                        </select>
                      ) : (
                        <p>Loading...</p>
                      )}
                      <label htmlFor="chequeNumber" className="required">
                        Cheque/IBFT Number:{" "}
                      </label>
                      <input
                        type="text"
                        name="chequeNumber"
                        id="chequeNumber"
                        value={updateMemberState.chequeNo}
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
                    value={convertDate(updateMemberState.paidDate)}
                    required
                    onChange={(e) =>
                      setUpdateMemberState({
                        ...updateMemberState,
                        date: e.target.value,
                      })
                    }
                  />
                  {Object.keys(updateMemberState.paymentDetail).length > 0 ? (
                    <>
                      {Object.entries(updateMemberState.paymentDetail).map(
                        ([headOfAccount, amount]) => (
                          <>
                            <label htmlFor={headOfAccount}>
                              {headOfAccount}
                            </label>
                            <input
                              type="number"
                              id={headOfAccount}
                              value={amount}
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                setUpdateMemberState((prevState) => ({
                                  ...prevState,
                                  paymentDetail: {
                                    ...prevState.paymentDetail,
                                    [headOfAccount]:
                                      inputValue === ""
                                        ? 0
                                        : parseInt(inputValue, 10),
                                  },
                                }));
                              }}
                            />
                          </>
                        )
                      )}
                      <button
                        type="submit"
                        className="blue-button"
                        onClick={editMember}
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <p>Loading...</p>
                  )}
                </>

                {isLoading && (
                  <div className="loading-indicator">
                    <div className="spinner"></div>
                  </div>
                )}
              </form>
            </div>
          </div>
        ))}
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
                                value={updateMemberState.bankAccount}
                                onChange={(e) => {
                                  setUpdateMemberState({
                                    ...updateMemberState,
                                    bank_account: e.target.value,
                                  });
                                }}
                              >
                                <option value="" hidden>
                                  Select Bank Account
                                </option>
                                {backAccount.map((item) => (
                                  <option value={item.accountNo}>
                                    {item.bankName} - {item.accountNo}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <p>Loading...</p>
                            )}
                            <label htmlFor="chequeNumber" className="required">
                              Cheque/IBFT Number:{" "}
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

      {showSection &&
        (console.log(selectedMember),
        (
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
                  <h4>Challan Number:</h4>
                  <p>{selectedMember?.challanNo || "-"}</p>
                </div>
                <div className="details-item">
                  <h4>Particular:</h4>
                  <p>{selectedMember?.particular || "-"}</p>
                </div>
                <div className="details-item">
                  <h4>Payment Type:</h4>
                  <p>{selectedMember?.check || "-"}</p>
                </div>
                {selectedMember?.check === "Bank" && (
                  <>
                    <div className="details-item">
                      <h4>Bank Account:</h4>
                      <p>{selectedMember?.bankAccount || "-"}</p>
                    </div>
                    <div className="details-item">
                      <h4>Cheque/IBFT Number:</h4>
                      <p>{selectedMember?.chequeNo || "-"}</p>
                    </div>
                  </>
                )}
                {/* Dynamic Payment Details */}
                {selectedMember?.paymentDetail &&
                  Object.entries(selectedMember.paymentDetail).map(
                    ([feeType, amount]) => (
                      <div className="details-item" key={feeType}>
                        <h4>{feeType}:</h4>
                        <p>{amount || "0"}</p>
                      </div>
                    )
                  )}
              </div>
            </div>
          </div>
        ))}
      <ToastContainer />
    </div>
  );
}
