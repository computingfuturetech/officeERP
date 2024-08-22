import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { showErrorToastMessage, showSuccessToastMessage } from "./toastUtils";

import { useNavigate } from "react-router-dom";
import "./style/memberListStyle.css";
import "./style/seller.css";

export default function PossessionComponent() {
  const [memberList, setMemberList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [msNo, setMsNo] = useState("");
  const [ShowButton, setShowButton] = useState(true);
  const [purchaseName, setPurchaseName] = useState("");
  const [showSection, setShowSection] = useState(false);

  const [selectedMember, setSelectedMember] = useState(null);
  const [editSection, setEditSection] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [formData, setFormData] = useState([]);
  const [addDues, setAddDues] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentType, setPaymentType] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [backAccount, setBankAccount] = useState([]);
  const [updateMemberState, setUpdateMemberState] = useState([]);

  const handleMsNumberChange = (e) => {
    setMsNo(e.target.value);
  };
  const membersRef = useRef(null);
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
      console.log(response.data);
      setBankAccount(response.data);
    } catch (error) {
      console.error(error);
      showErrorToastMessage("Error getting Bank Accounts");
    }
  };

  const fetchMemberList = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user/getPossessionFee`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setMemberList(response.data);
      console.log(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page]);
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
    handleBankAccount();
  };
  useEffect(() => {
    fetchMemberList();
  }, [fetchMemberList]);

  const handleScroll = useCallback(() => {
    if (membersRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = membersRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 50 && !loading) {
        setPage((prevPage) => prevPage + 1);
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

  const handleShowOptions = (member) => {
    setSelectedMember(member);
    setShowOptions(!showOptions);
  };

  const handleAddDues = () => {
    handleBankAccount();
    getPossessionHeadOfAccount();
    setAddDues(true);
  };

  const closeSection = () => {
    setAddDues(false);
    setShowSection(false);
    setEditSection(false);
    setIsLoading(false);
    setFormData([]);
    setUpdateMemberState([]);
    setShowForm(false);
    setShowButton(true);
    setPurchaseName("");
    setMsNo("");
    setPaymentType("");
    setBankAccount([]);
  };

  const handleShowSection = (member) => {
    setSelectedMember(member);
    setShowSection(true);
    setShowOptions(false);
  };

  const convertDate = (e) => {
    const dateValue = new Date(e).toISOString().split("T")[0];
    return dateValue;
  };

  const getPossessionHeadOfAccount = async () => {
    setIsLoading(true);
    try {
      const config = {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      };
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user/getIncomeHeadOfAccount/?type=Possession Heads`,
        config
      );
      console.log(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleEditSection = (member) => {
    setUpdateMemberState(member);
    setEditSection(true);
    setSelectedMember(member);
    setShowOptions(false);
  };
  const handleSubmit = (e) => {
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
      type: "Possession Heads",
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
          `${process.env.REACT_APP_API_URL}/user/createPossessionFee`,
          data,
          config
        );
        closeSection();
        showSuccessToastMessage("Added Successfully");
      } catch (error) {
        console.error(error);
      } finally {
        setFormData([]);
        setBankAccount([]);
      }
    };
    update();
  };
  return (
    <div className="member-list">
      <div className="title">
        <h2>Possession Income</h2>
        <div className="title-buttons">
          <button className="blue-button" onClick={handleAddDues}>
            Add Fee
          </button>
          <button
            className="simple-button"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
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
        {memberList.map((member) => (
          <div className="member" key={member.id}>
            <div className="member-details">
              <p>{member.memberNo.msNo || "-"}</p>
              <p>{member.memberNo.purchaseName || "-"}</p>
              <p>{member.amount || "-"}</p>
              <p>
                {member.paidDate
                  ? new Date(member.paidDate).toISOString().split("T")[0]
                  : "-"}
              </p>
              <img
                onClick={() => handleShowOptions(member)}
                src="data:image/svg+xml,%3Csvg width='800px' height='800px' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:%23231f20;stroke:null;stroke-linecap:round;stroke-linejoin:round;stroke-width:2px;%7D%3C/style%3E%3C/defs%3E%3Cg id='more'%3E%3Ccircle class='cls-1' cx='16' cy='16' r='2'/%3E%3Ccircle class='cls-1' cx='6' cy='16' r='2'/%3E%3Ccircle class='cls-1' cx='26' cy='16' r='2'/%3E%3C/g%3E%3C/svg%3E"
                alt="Member Icon"
              />
            </div>
            {selectedMember === member && showOptions && (
              <div className="options income">
                <button onClick={() => handleShowSection(member)}>Show</button>
                <div className="horizontal-divider"></div>
                <button onClick={() => handleEditSection(member)}>Edit</button>
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
            <h3>Add Possession Fee</h3>
            <div className="horizontal-divider"></div>
            <form onSubmit={handleSubmit}>
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
                  <div className="horizontal-divider"></div>
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
                          <label htmlFor={item._id}>{item.headOfAccount}</label>
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
                        onClick={handleSubmit}
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
          </div>
        </div>
      )}
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

      {showSection &&
        (console.log(selectedMember),
        (
          <div className="left-section">
            <div className="left-section-content">
              <div onClick={closeSection} className="close-button"></div>
              <h3>Possession Fee Details</h3>
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

      {/* {editSection && (
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

              <label htmlFor="electricityConnectionCharges">
                Electricity Connection Charges:
              </label>
              <input
                type="text"
                id="electricityConnectionCharges"
                name="electricityConnectionCharges"
                value={formData.electricityConnectionCharges}
                onChange={handleChange}
              />

              <label htmlFor="waterConnectionCharges">
                Water Connection Charges:
              </label>
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

              <label htmlFor="constructionWater">
                Construction Water (Water for 6 months):
              </label>
              <input
                type="text"
                id="constructionWater"
                name="constructionWater"
                value={formData.constructionWater}
                onChange={handleChange}
              />

              <label htmlFor="buildingBylawsCharges">
                Building Bylaws Charges:
              </label>
              <input
                type="text"
                id="buildingBylawsCharges"
                name="buildingBylawsCharges"
                value={formData.buildingBylawsCharges}
                onChange={handleChange}
              />

              <button
                type="submit"
                className="blue-button"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Edit"}
              </button>
            </form>
          </div>
        </div>
      )} */}
      <ToastContainer />
    </div>
  );
}
