import React from "react";
import { useEffect, useState, useRef } from "react";
import "./style/memberListStyle.css";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import { showErrorToastMessage, showSuccessToastMessage } from "./toastUtils";
import { ToastContainer } from "react-toastify";

function SiteExpenseComponent() {
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [siteExpensesList, setsiteExpensesList] = useState([]);
  const membersRef = useRef(null);
  const [showOptions, setShowOptions] = useState(false);
  const [page, setPage] = useState(1);
  const [editSection, setEditSection] = useState(false);
  const [addNew, setAddNew] = useState(false);
  const [amount, setAmount] = useState("");
  const [particular, setParticular] = useState("");
  const [vendor, setVendor] = useState("");
  const [date, setDate] = useState("");
  const [headOfAccount, setHeadOfAccount] = useState("");
  const [expenseType, setExpenseType] = useState("");
  const [challanNo, setChallanNo] = useState("");

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [SubHeadOfAccount, setSubHeadOfAccount] = useState("");
  const SubHeads = ["A Block", "D Block"];
  const [plotNumber, setPlotNumber] = useState("");

  const MISC_site_SUBHEADS = ["Dengue", "Weapon", "Demarcation"];
  const Connection_site_SUBHEADS = ["Electricity", "Water Connection"];
  const Repair_site_SUBHEADS = ["Phase 1", "Phase 2"];
  const Sub_Disposal_Heads = ["Disposal", "Vehicle"];
  const HEADOFACCOUNTLIST = [
    "Salary",
    "Lesco Site",
    "Vehicle/Disposal",
    "Electricity/Water Connection",
    "Repair/Maintainance",
    "Misc",
  ];
  const [HeadOfAccountssiteList, setHeadOfAccountssiteList] = useState([]);
  const [billingMonth, setBillingMonth] = useState("");
  const [advTax, setAdvTax] = useState("");
  const [billReference, setBillReference] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [fuelLitre, setFuelLitre] = useState("");
  const [vehichleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [auditFee, setAuditFeeChange] = useState("");
  const [auditYear, setAuditYear] = useState("");
  const [description, setDescription] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [lescoSubHead, setLescoSubHead] = useState("");
  const [bankList, setBankList] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expenseId, setExpenseId] = useState("");
  const [chequeNo, setChequeNo] = useState("");
  const [blockType, setBlockType] = useState("");

  useEffect(() => {
    fetchBanks();
  }, []);
  const fetchBanks = async () => {
    try {
      const config = {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      };
      const response = await axios.get(
        process.env.REACT_APP_API_URL +
          "/user/getAllExpense?expense_type=Site%20Expense",
        config
      );
      setsiteExpensesList(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    const fetchHeadOfAccounts = async () => {
      try {
        const config = {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        };
        const response = await axios.get(
          process.env.REACT_APP_API_URL +
            "/user/listOfHeadOfAccount?expense_type=Site%20Expense",
          config
        );
        setHeadOfAccountssiteList(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchHeadOfAccounts();
  }, []);

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

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const config = {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        };
        const response = await axios.get(
          process.env.REACT_APP_API_URL + `/user/bankList`,
          config
        );
        setBankList(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBanks();
  }, []);

  const handleAddNew = () => {
    scrollToTop();
    setSelectedMember(null);
    setAddNew(true);
    setShowOptions(false);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleBillingMonthChange = (e) => {
    setBillingMonth(e.target.value);
  };

  const handleAdvTaxChange = (e) => {
    setAdvTax(e.target.value);
  };

  const handleBillReferenceChange = (e) => {
    setBillReference(e.target.value);
  };
  const handleBankAccountChange = (e) => setBankAccount(e.target.value);
  const handleBankNameChange = (e) => setBankName(e.target.value);

  const handleChequeNumberChange = (e) => {
    setChequeNumber(e.target.value);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const handleParticularChange = (e) => {
    setParticular(e.target.value);
  };
  const handleVendorChange = (e) => {
    setVendor(e.target.value);
  };
  const handleHeadOfAccountChange = (e) => {
    setHeadOfAccount(e.target.value);
    setAmount("");
    setDate("");
    setAdvTax("");
    setAuditFeeChange("");
    setAuditYear("");
    setBankAccount("");
    setBankName("");
    setBillingMonth("");
    setDescription("");
    setEmployeeName("");
    setParticular("");
    setVendor("");
    setFuelLitre("");
    setVehicleNumber("");
    setVehicleType("");
    setBillReference("");
    setChallanNo("");
    setChequeNo("");
    setSubHeadOfAccount("");
    setLescoSubHead("");
    setPlotNumber("");
    setExpenseType("");
    setBankAccount("");
    setBankAccount("");
  };
  const handleEditSection = async (member) => {
    setIsLoading(true);
    scrollToTop();
    setSelectedMember(member);
    const mainId = member._id;
    setExpenseId(mainId);
    const headOfAccountId =
      member.mainHeadOfAccount?._id || member.subHeadOfAccount?._id;

    try {
      const config = {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      };
      const response = await axios.get(
        process.env.REACT_APP_API_URL +
          `/user/getSingleExpense?headOfAccountId=${headOfAccountId}&mainId=${mainId}`,
        config
      );
      const expenseData = response.data;
      let headOfAccountValue = expenseData.mainHeadOfAccount
        ? expenseData.mainHeadOfAccount.headOfAccount
        : expenseData.subHeadOfAccount.headOfAccount;
      if (expenseData.subHeadOfAccount) {
        if (expenseData.subHeadOfAccount.headOfAccount === "A Block") {
          setLescoSubHead("A Block");
        } else if (expenseData.subHeadOfAccount.headOfAccount === "D Block") {
          setLescoSubHead("D Block");
        }
        const headMapping = {
          Dengue: "Misc",
          Weapon: "Misc",
          Demarcation: "Misc",
          "A Block": "Lesco Site",
          "D Block": "Lesco Site",
          Electricity: "Electricity/Water Connection",
          Disposal: "Vehicle/Disposal",
          Vehicle: "Vehicle/Disposal",
          "Water Connection": "Electricity/Water Connection",
          "Phase 1": "Repair/Maintainance",
          "Phase 2": "Repair/Maintainance",
        };

        const subHeadMapping = {
          Dengue: "Dengue",
          Weapon: "Weapon",
          Vehicle: "Vehicle",
          Disposal: "Disposal",
        };
        headOfAccountValue =
          headMapping[headOfAccountValue] || headOfAccountValue;
        setSubHeadOfAccount(
          subHeadMapping[expenseData.subHeadOfAccount?.headOfAccount] ||
            expenseData.subHeadOfAccount?.headOfAccount
        );
      }
      setHeadOfAccount(headOfAccountValue);
      if (headOfAccountValue === "Electricity")
        setHeadOfAccount("Electricity/Water Connection");
      if (headOfAccountValue === "Salaries Site Employees")
        setHeadOfAccount("Salary");
      if (headOfAccountValue === "Salaries Office Employees")
        setHeadOfAccount("Salary");
      setAmount(expenseData.amount);
      setParticular(expenseData.particular);
      setDate(convertDate(expenseData.paidDate));
      setVendor(expenseData.vendor);
      setPlotNumber(expenseData.plotNumber);
      setEmployeeName(expenseData.employeeName);
      setBillingMonth(expenseData.billingMonth);
      setAdvTax(expenseData.advTax);
      setBillReference(expenseData.billReference);
      setAuditYear(expenseData.year);
      setFuelLitre(expenseData.fuelLitre);
      setPlotNumber(expenseData.plotNumber);
      setDescription(expenseData.description);
      setChallanNo(expenseData.challanNo);
      setBlockType(expenseData.block);
      setExpenseType(expenseData.check);
      setVehicleNumber(expenseData.vehicleNumber);
      setVehicleType(expenseData.vehicleType);
      if (expenseData.bank) {
        setChequeNo(expenseData.chequeNumber);
        setBankAccount(expenseData.bank.accountNo);
        setBankName(expenseData.bank.bankName);
      }
    } catch (error) {
      console.error("Error fetching expense data:", error);
      closeSection();
      showErrorToastMessage("Error Occured Try Again!");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
      setShowOptions(false);
      setEditSection(true);
    }
  };
  const handleShowOptions = (member) => {
    setSelectedMember(member);
    setShowOptions(!showOptions);
  };

  const closeSection = () => {
    setAddNew(false);
    setAmount("");
    setEditSection(false);
    setParticular("");
    setVendor("");
    setDate("");
    setHeadOfAccount("");
    setExpenseType("");
    setChallanNo("");
    setSubHeadOfAccount("");
    setLescoSubHead("");
    setPlotNumber("");
    setBankAccount("");
    setBankName("");
    setBillReference("");
    setBillingMonth("");
    setDescription("");
    setEmployeeName("");
    setParticular("");
    setVendor("");
    setFuelLitre("");
    setVehicleNumber("");
    setVehicleType("");
    setAuditFeeChange("");
    setAuditYear("");
    setChequeNumber("");
    setChequeNo("");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handlePlotNumberChange = (e) => {
    setPlotNumber(e.target.value);
  };

  const convertDate = (e) => {
    const dateValue = new Date(e).toISOString().split("T")[0];
    return dateValue;
  };

  const handleScroll = () => {
    if (membersRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = membersRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 50 && !loading) {
        setPage((prevPage) => prevPage + 1);
      }
    }
  };
  const handleSubHeadOfAccountChange = (e) => {
    setSubHeadOfAccount(e.target.value);
  };

  const EditsiteExpense = (e) => {
    e.preventDefault();
    let data = {};
    let url = "";

    switch (headOfAccount) {
      case "Lesco Site":
        url = "/user/updateOfficeUtilExpense?id=" + expenseId;
        data = {
          head_of_account: lescoSubHead,
          bill_reference: billReference,
          amount: amount,
          billing_month: billingMonth,
          paid_date: date,
          adv_tax: advTax,

          check: expenseType,
          cheque_no: chequeNo,
          challan_no: challanNo,
          bank_account: bankAccount,
        };

        break;

      case "Salary":
        url = `/user/updateSalary?id=${expenseId}`;
        data = {
          salary_type: "Site",
          head_of_account: "Salaries Site Employees",
          cheque_no: chequeNumber,
          amount: amount,
          bank_account: bankAccount,
          paid_date: date,
        };
        break;

      case "Vehicle/Disposal":
        switch (SubHeadOfAccount) {
          case "Disposal":
            url = `/user/updateVehicleDisposal?id=${expenseId}`;
            data = {
              head_of_account: "Disposal",
              amount: amount,
              paid_date: date,
              fuel_litre: fuelLitre,
            };
            break;
          case "Vehicle":
            url = `/user/updateVehicleDisposal?id=${expenseId}`;
            data = {
              head_of_account: "Vehicle",
              amount: amount,
              vehicle_number: vehichleNumber,
              vehicle_type: vehicleType,
              paid_date: date,
              fuel_litre: fuelLitre,
            };
            break;
          default:
            return;
        }
        break;

      case "Electricity/Water Connection":
        url = `/user/updateElectricityWaterExpense?id=${expenseId}`;
        data = {
          head_of_account: SubHeadOfAccount,
          amount: amount,
          paid_date: date,
          vendor: vendor,
          description: description,
          check: expenseType,
          challan_no: challanNo,
          cheque_no: chequeNo,
        };
        break;

      case "Repair/Maintainance":
        switch (SubHeadOfAccount) {
          case "Phase 1":
            url = `/user/updateLegalProfessionalExpense?id=${expenseId}`;
            data = {
              head_of_account: "Phase 1",
              amount: amount,
              particular: particular,
              paid_date: date,
              vendor: vendor,
              check: expenseType,
              challan_no: challanNo,
              cheque_no: chequeNo,
            };
            break;
          case "Phase 2":
            url = `/user/updateLegalProfessionalExpense?id=${expenseId}`;
            data = {
              head_of_account: "Phase 2",
              amount: amount,
              particular: particular,
              paid_date: date,
              vendor: vendor,
              check: expenseType,
              challan_no: challanNo,
              cheque_no: chequeNo,
            };
            break;
          default:
            return;
        }
        break;

      case "Misc":
        switch (SubHeadOfAccount) {
          case "Dengue":
            url = `/user/updateMiscellaneousExpense?id=${expenseId}`;
            data = {
              head_of_account: SubHeadOfAccount,
              amount: amount,
              paid_date: date,
              description: description,
              check: expenseType,
              challan_no: challanNo,
              cheque_no: chequeNo,
              bank_account: bankAccount,
            };
            break;
          case "Weapon":
            url = `/user/updateMiscellaneousExpense?id=${expenseId}`;
            data = {
              head_of_account: SubHeadOfAccount,
              amount: amount,
              paid_date: date,
              description: description,
              check: expenseType,
              challan_no: challanNo,
              cheque_no: chequeNo,
              bank_account: bankAccount,
            };
            break;
          case "Demarcation":
            url = `/user/updateMiscellaneousExpense?id=${expenseId}`;
            data = {
              head_of_account: SubHeadOfAccount,
              amount: amount,
              paid_date: date,
              plot_number: plotNumber,
              vendor: vendor,
              check: expenseType,
              challan_no: challanNo,
              cheque_no: chequeNo,
              bank_account: bankAccount,
              description: description,
            };
            break;
          default:
            return;
        }
        break;

      default:
        return;
    }

    const updateExpense = async () => {
      try {
        const config = {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        };
        const response = await axios.post(
          process.env.REACT_APP_API_URL + url,
          data,
          config
        );
        showSuccessToastMessage("Expense Updated Successfully!");
        closeSection();
        fetchBanks();
        setAmount("");
        setDate("");
        setAdvTax("");
        setHeadOfAccount("");
        setSubHeadOfAccount("");
        setAuditFeeChange("");
        setAuditYear("");
        setBankAccount("");
        setBankName("");
        setBillReference("");
        setBillingMonth("");
        setDescription("");
        setEmployeeName("");
        setParticular("");
        setVendor("");
      } catch (error) {
        console.error(error);
        showErrorToastMessage("Error Updating. Please Try Again!");
      }
    };

    updateExpense();
  };
  const createNewSiteExpense = (e) => {
    e.preventDefault();
    let data = {};
    let url = "";

    switch (headOfAccount) {
      case "Lesco Site":
        url = "/user/createOfficeUtilExpense";
        data = {
          head_of_account: SubHeadOfAccount,
          bill_reference: billReference,
          amount: amount,
          billing_month: billingMonth,
          paid_date: date,
          adv_tax: advTax,
          check: expenseType,
          cheque_no: chequeNo,
          challan_no: challanNo,
          bank_account: bankAccount,
        };
        break;
      case "Salary":
        url = "/user/createSalary";
        data = {
          salary_type: "Site",
          head_of_account: "Salaries Site Employees",
          cheque_no: chequeNumber,
          amount: amount,
          bank_account: bankAccount,
          paid_date: date,
        };
        break;

      case "Vehicle/Disposal":
        switch (SubHeadOfAccount) {
          case "Disposal":
            url = "/user/createVehicleDisposal";
            data = {
              head_of_account: "Disposal",
              amount: amount,
              paid_date: date,
              fuel_litre: fuelLitre,
            };
            break;
          case "Vehicle":
            url = "/user/createVehicleDisposal";
            data = {
              head_of_account: "Vehicle",
              amount: amount,
              vehicle_number: vehichleNumber,
              vehicle_type: vehicleType,
              paid_date: date,
              fuel_litre: fuelLitre,
            };
            break;
          default:
            return;
        }
        break;

      case "Electricity/Water Connection":
        switch (SubHeadOfAccount) {
          case "Electricity":
            url = "/user/createElectricityWaterExpense";
            data = {
              head_of_account: SubHeadOfAccount,
              amount: amount,
              paid_date: date,
              description: description,
              vendor: vendor,
              check: expenseType,
              cheque_no: chequeNo,
              challan_no: challanNo,
              bank_account: bankAccount,
            };
          case "Water Connection":
            url = "/user/createElectricityWaterExpense";
            data = {
              head_of_account: SubHeadOfAccount,
              amount: amount,
              paid_date: date,
              vendor: vendor,
              description: description,
              check: expenseType,
              cheque_no: chequeNo,
              challan_no: challanNo,
              bank_account: bankAccount,
            };
            break;
          default:
            return;
        }
        break;

      case "Repair/Maintainance":
        switch (SubHeadOfAccount) {
          case "Phase 1":
            url = "/user/createLegalProfessionalExpense";
            data = {
              head_of_account: "Phase 1",
              amount: amount,
              particular: particular,
              paid_date: date,
              vendor: vendor,
              check: expenseType,
              bank_account: bankAccount,
              challan_no: challanNo,
              cheque_no: chequeNo,
            };
            break;
          case "Phase 2":
            url = "/user/createLegalProfessionalExpense";
            data = {
              head_of_account: "Phase 2",
              amount: amount,
              particular: particular,
              paid_date: date,
              vendor: vendor,
              check: expenseType,
              challan_no: challanNo,
              bank_account: bankAccount,
              cheque_no: chequeNo,
            };
            break;
          default:
            return;
        }
        break;

      case "Misc":
        switch (SubHeadOfAccount) {
          case "Dengue":
            url = "/user/createMiscellaneousExpense";
            data = {
              head_of_account: SubHeadOfAccount,
              amount: amount,
              paid_date: date,
              description: description,
              check: expenseType,
              challan_no: challanNo,
              cheque_no: chequeNo,
              bank_account: bankAccount,
            };
            break;
          case "Weapon":
            url = "/user/createMiscellaneousExpense";
            data = {
              head_of_account: SubHeadOfAccount,
              amount: amount,
              paid_date: date,
              description: description,
              check: expenseType,
              challan_no: challanNo,
              cheque_no: chequeNo,
              bank_account: bankAccount,
            };
            break;
          case "Demarcation":
            url = "/user/createMiscellaneousExpense";
            data = {
              head_of_account: SubHeadOfAccount,
              amount: amount,
              paid_date: date,
              vendor_name: vendor,
              plot_number: plotNumber,
              check: expenseType,
              challan_no: challanNo,
              cheque_no: chequeNo,
              bank_account: bankAccount,
              description: description,
            };
            break;
          default:
            return;
        }
        break;

      default:
        return;
    }

    const createExpense = async () => {
      try {
        const config = {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        };
        const response = await axios.post(
          process.env.REACT_APP_API_URL + url,
          data,
          config
        );
        showSuccessToastMessage("Expense Is Added Successfully");
        setAmount("");
        setDate("");
        fetchBanks();
        setAdvTax("");
        setAuditFeeChange("");
        setAuditYear("");
        setHeadOfAccount("");
        setSubHeadOfAccount("");
        setBillReference("");
        setBankAccount("");
        setBankName("");
        setBillingMonth("");
        setDescription("");
        setEmployeeName("");
        setParticular("");
        setVendor("");
        setFuelLitre("");
        setVehicleNumber("");
        setVehicleType("");
        closeSection();
      } catch (error) {
        console.error(error);
        showErrorToastMessage("Error Please Try Again!");
      }
    };
    createExpense();
  };
  return (
    <>
      <div className="member-list">
        <div className="title">
          <h2>Site Expense</h2>
          <div className="title-buttons">
            <button className="blue-button" onClick={handleAddNew}>
              Add New
            </button>
            <button className="simple-button" onClick={handleRefresh}>
              Refresh
            </button>
          </div>
        </div>
        <div className="top-bar">
          <div className="top-bar-item">
            <h4>Sub Head Of Account</h4>
            <h4>Paid Date</h4>
            <h4>Amount</h4>
            <h4></h4>
          </div>
        </div>

        {/* List Display */}
        <div className={`members ${loading ? "loading" : ""}`} ref={membersRef}>
          {siteExpensesList.map((member) => (
            <div className="member" key={member._id}>
              <div className="member-details">
                <p>
                  {member.mainHeadOfAccount
                    ? member.mainHeadOfAccount.headOfAccount
                    : member.subHeadOfAccount?.headOfAccount}
                </p>
                <p>{convertDate(member.paidDate)}</p>
                <p>{member.amount}</p>
                <img
                  onClick={() => handleShowOptions(member)}
                  src="data:image/svg+xml,%3Csvg width='800px' height='800px' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:%23231f20;stroke:null;stroke-linecap:round;stroke-linejoin:round;stroke-width:2px;%7D%3C/style%3E%3C/defs%3E%3Cg id='more'%3E%3Ccircle class='cls-1' cx='16' cy='16' r='2'/%3E%3Ccircle class='cls-1' cx='6' cy='16' r='2'/%3E%3Ccircle class='cls-1' cx='26' cy='16' r='2'/%3E%3C/g%3E%3C/svg%3E"
                  alt="Member Icon"
                />
              </div>
              {selectedMember === member && showOptions && (
                <div className="options income">
                  <button onClick={() => handleEditSection(member)}>
                    Edit
                  </button>
                  <div className="horizontal-divider"></div>
                  <button>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ADD NEW SEcTION */}

        {addNew && (
          <div className="left-section">
            <div className="left-section-content">
              <div onClick={closeSection} className="close-button"></div>
              <h3>Add Site Expense</h3>
              <div className="horizontal-divider"></div>
              <form onSubmit={createNewSiteExpense}>
                <label htmlFor="headOfAccount">Head Of Account: </label>
                <select
                  name="headOfAccount"
                  id="headOfAccount"
                  onChange={handleHeadOfAccountChange}
                >
                  <option value={headOfAccount} hidden>
                    {headOfAccount}
                  </option>
                  {HEADOFACCOUNTLIST.map((headOfAccount, index) => (
                    <option key={index} value={headOfAccount}>
                      {headOfAccount}
                    </option>
                  ))}
                </select>

                {headOfAccount === "Salary" && (
                  <>
                    <label htmlFor="chequeNumber">Cheque Number: </label>
                    <input
                      type="number"
                      name="chequeNumber"
                      id="chequeNumber"
                      value={chequeNumber}
                      onChange={handleChequeNumberChange}
                    />
                    <label htmlFor="bank-name">Bank Name: </label>
                    <select
                      name="bank-name"
                      id="bank-name"
                      onChange={handleBankNameChange}
                    >
                      <option value="select" hidden>
                        {bankName}
                      </option>
                      {bankList.map((bank) => (
                        <option value={bank._id} key={bank._id}>
                          {bank.bankName} - {bank.branchCode}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="purchaseName">Account Number: </label>
                    <select
                      name="account-number"
                      id="account-number"
                      onChange={handleBankAccountChange}
                    >
                      <option value="select" hidden>
                        Select
                      </option>
                      {bankList
                        .filter((bank) => bank._id === bankName)
                        .map((bank) => (
                          <option value={bank.accountNo} key={bank.accountNo}>
                            {bank.accountNo}
                          </option>
                        ))}
                    </select>
                    <label htmlFor="amount">Amount: </label>
                    <input
                      type="number"
                      name="amount"
                      id="amount"
                      value={amount}
                      onChange={handleAmountChange}
                    />
                    <label htmlFor="paidDate">Paid Date: </label>
                    <input
                      type="date"
                      name="paidDate"
                      id="paidDate"
                      value={date}
                      onChange={handleDateChange}
                    />
                  </>
                )}

                {headOfAccount === "Lesco Site" && (
                  <>
                    <label htmlFor="subHeadOfAccount">
                      Sub Head Of Account{" "}
                    </label>
                    <select
                      name="subHeadOfAccount"
                      id="subHeadOfAccount"
                      onChange={handleSubHeadOfAccountChange}
                    >
                      <option value="select" hidden>
                        {SubHeadOfAccount}
                      </option>
                      {SubHeads.map((expense, index) => (
                        <option key={index} value={expense}>
                          {expense}
                        </option>
                      ))}
                    </select>
                    {(SubHeadOfAccount === "A Block" ||
                      SubHeadOfAccount === "D Block") && (
                      <>
                        <label htmlFor="billingMonth">Billing Month: </label>
                        <select
                          name="billingMonth"
                          id="billingMonth"
                          value={billingMonth}
                          onChange={handleBillingMonthChange}
                          required
                        >
                          <option value="select" hidden>
                            Select
                          </option>
                          {months.map((month, index) => (
                            <option key={index} value={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                        <label htmlFor="advTax">Adv Tax </label>
                        <input
                          type="text"
                          name="advTax"
                          id="advTax"
                          value={advTax}
                          onChange={handleAdvTaxChange}
                        />
                        <label htmlFor="billReference">Bill Reference </label>
                        <input
                          type="number"
                          name="billReference"
                          id="billReference"
                          value={billReference}
                          onChange={handleBillReferenceChange}
                        />

                        <label htmlFor="challanno">Challan No: </label>
                        <input
                          type="text"
                          name="challanno"
                          id="challanno"
                          value={challanNo}
                          onChange={(e) => setChallanNo(e.target.value)}
                          required
                        />
                        <label htmlFor="expenseType">Type: </label>
                        <select
                          name="expenseType"
                          id="expenseType"
                          onChange={(e) => setExpenseType(e.target.value)}
                          required
                        >
                          <option value="select" hidden>
                            Select
                          </option>
                          <option value="Cash">Cash</option>
                          <option value="Bank">Bank</option>
                        </select>
                        {expenseType === "Bank" && (
                          <>
                            <label htmlFor="bank-name">Bank Name: </label>
                            <select
                              name="bank-name"
                              id="bank-name"
                              onChange={handleBankNameChange}
                            >
                              <option value="select" hidden>
                                {bankName}
                              </option>
                              {bankList.map((bank) => (
                                <option value={bank._id} key={bank._id}>
                                  {bank.bankName} - {bank.branchCode}
                                </option>
                              ))}
                            </select>
                            <label htmlFor="purchaseName">
                              Account Number:{" "}
                            </label>
                            <select
                              name="account-number"
                              id="account-number"
                              onChange={handleBankAccountChange}
                            >
                              <option value="select" hidden>
                                Select
                              </option>
                              {bankList
                                .filter((bank) => bank._id === bankName)
                                .map((bank) => (
                                  <option
                                    value={bank.accountNo}
                                    key={bank.accountNo}
                                  >
                                    {bank.accountNo}
                                  </option>
                                ))}
                            </select>
                            <label htmlFor="chequeNo">Cheque No: </label>
                            <input
                              type="text"
                              name="chequeNo"
                              id="chequeNo"
                              value={chequeNo}
                              onChange={(e) => setChequeNo(e.target.value)}
                              required
                            />
                          </>
                        )}
                        <label htmlFor="paidDate">Paid Date: </label>
                        <input
                          type="date"
                          name="paidDate"
                          id="paidDate"
                          value={date}
                          onChange={handleDateChange}
                        />
                        <label htmlFor="amount">Amount: </label>
                        <input
                          type="number"
                          name="amount"
                          id="amount"
                          value={amount}
                          onChange={handleAmountChange}
                        />
                      </>
                    )}
                  </>
                )}
                {headOfAccount === "Vehicle/Disposal" && (
                  <>
                    <label htmlFor="subHeadOfAccount">
                      Sub Head Of Account:{" "}
                    </label>
                    <select
                      name="subHeadOfAccount"
                      id="subHeadOfAccount"
                      onChange={handleSubHeadOfAccountChange}
                    >
                      <option value="select" hidden>
                        Select
                      </option>
                      {Sub_Disposal_Heads.map((subHead, index) => (
                        <option key={index} value={subHead}>
                          {subHead}
                        </option>
                      ))}
                    </select>

                    {SubHeadOfAccount === "Disposal" && (
                      <>
                        <label htmlFor="fuelLitre">Fuel Litre: </label>
                        <input
                          type="number"
                          name="fuelLitre"
                          id="fuelLitre"
                          value={fuelLitre}
                          onChange={(e) => setFuelLitre(e.target.value)}
                        />
                        <label htmlFor="amount">Amount: </label>
                        <input
                          type="number"
                          name="amount"
                          id="amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                        <label htmlFor="paidDate">Paid Date: </label>
                        <input
                          type="date"
                          name="paidDate"
                          id="paidDate"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                      </>
                    )}

                    {SubHeadOfAccount === "Vehicle" && (
                      <>
                        <label htmlFor="vehichleNumber">Vehicle Number: </label>
                        <input
                          type="number"
                          name="vehichleNumber"
                          id="vehichleNumber"
                          value={vehichleNumber}
                          onChange={(e) => setVehicleNumber(e.target.value)}
                        />
                        <label htmlFor="vehicleType">Vehicle Type: </label>
                        <input
                          type="text"
                          name="vehicleType"
                          id="vehicleType"
                          value={vehicleType}
                          onChange={(e) => setVehicleType(e.target.value)}
                        />
                        <label htmlFor="fuelLitre">Fuel Litre: </label>
                        <input
                          type="number"
                          name="fuelLitre"
                          id="fuelLitre"
                          value={fuelLitre}
                          onChange={(e) => setFuelLitre(e.target.value)}
                        />
                        <label htmlFor="amount">Amount: </label>
                        <input
                          type="number"
                          name="amount"
                          id="amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                        <label htmlFor="paidDate">Paid Date: </label>
                        <input
                          type="date"
                          name="paidDate"
                          id="paidDate"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                      </>
                    )}
                  </>
                )}
                {headOfAccount === "Repair/Maintainance" && (
                  <>
                    <label htmlFor="subHeadOfAccount">Select Phase: </label>
                    <select
                      name="subHeadOfAccount"
                      id="subHeadOfAccount"
                      onChange={handleSubHeadOfAccountChange}
                    >
                      <option value="select" hidden>
                        Select
                      </option>
                      {Repair_site_SUBHEADS.map((subHead, index) => (
                        <option key={index} value={subHead}>
                          {subHead}
                        </option>
                      ))}
                    </select>

                    {(SubHeadOfAccount === "Phase 1" ||
                      SubHeadOfAccount === "Phase 2") && (
                      <>
                        <label htmlFor="challanno">Challan No: </label>
                        <input
                          type="text"
                          name="challanno"
                          id="challanno"
                          value={challanNo}
                          onChange={(e) => setChallanNo(e.target.value)}
                          required
                        />
                        <label htmlFor="expenseType">Type: </label>
                        <select
                          name="expenseType"
                          id="expenseType"
                          onChange={(e) => setExpenseType(e.target.value)}
                          required
                        >
                          <option value="select" hidden>
                            Select
                          </option>
                          <option value="Cash">Cash</option>
                          <option value="Bank">Bank</option>
                        </select>
                        {expenseType === "Bank" && (
                          <>
                            <label htmlFor="bank-name">Bank Name: </label>
                            <select
                              name="bank-name"
                              id="bank-name"
                              onChange={handleBankNameChange}
                            >
                              <option value="select" hidden>
                                {bankName}
                              </option>
                              {bankList.map((bank) => (
                                <option value={bank._id} key={bank._id}>
                                  {bank.bankName} - {bank.branchCode}
                                </option>
                              ))}
                            </select>
                            <label htmlFor="purchaseName">
                              Account Number:{" "}
                            </label>
                            <select
                              name="account-number"
                              id="account-number"
                              onChange={handleBankAccountChange}
                            >
                              <option value="select" hidden>
                                Select
                              </option>
                              {bankList
                                .filter((bank) => bank._id === bankName)
                                .map((bank) => (
                                  <option
                                    value={bank.accountNo}
                                    key={bank.accountNo}
                                  >
                                    {bank.accountNo}
                                  </option>
                                ))}
                            </select>
                            <label htmlFor="chequeNo">Cheque No: </label>
                            <input
                              type="text"
                              name="chequeNo"
                              id="chequeNo"
                              value={chequeNo}
                              onChange={(e) => setChequeNo(e.target.value)}
                              required
                            />
                          </>
                        )}
                        <label htmlFor="amount">Amount: </label>
                        <input
                          type="number"
                          name="amount"
                          id="amount"
                          value={amount}
                          onChange={handleAmountChange}
                        />
                        <label htmlFor="particular">Particular: </label>
                        <input
                          type="text"
                          name="particular"
                          id="particular"
                          value={particular}
                          onChange={handleParticularChange}
                        />
                        <label htmlFor="date">Date: </label>
                        <input
                          type="date"
                          name="date"
                          id="date"
                          value={date}
                          onChange={handleDateChange}
                        />
                        <label htmlFor="vendor">Vendor</label>
                        <input
                          type="text"
                          name="vendor"
                          id="vendor"
                          value={vendor}
                          onChange={handleVendorChange}
                        />
                      </>
                    )}
                  </>
                )}

                {headOfAccount === "Misc" && (
                  <>
                    <label htmlFor="subHeadOfAccount">
                      Sub Head Of Account:{" "}
                    </label>
                    <select
                      name="subHeadOfAccount"
                      id="subHeadOfAccount"
                      onChange={handleSubHeadOfAccountChange}
                    >
                      <option value="select" hidden>
                        Select
                      </option>
                      {MISC_site_SUBHEADS.map((subHead, index) => (
                        <option key={index} value={subHead}>
                          {subHead}
                        </option>
                      ))}
                    </select>

                    {(SubHeadOfAccount === "Weapon" ||
                      SubHeadOfAccount === "Demarcation" ||
                      SubHeadOfAccount === "Dengue") && (
                      <>
                        <label htmlFor="challanno">Challan No: </label>
                        <input
                          type="text"
                          name="challanno"
                          id="challanno"
                          value={challanNo}
                          onChange={(e) => setChallanNo(e.target.value)}
                          required
                        />
                        <label htmlFor="expenseType">Type: </label>
                        <select
                          name="expenseType"
                          id="expenseType"
                          onChange={(e) => setExpenseType(e.target.value)}
                          required
                        >
                          <option value="select" hidden>
                            Select
                          </option>
                          <option value="Cash">Cash</option>
                          <option value="Bank">Bank</option>
                        </select>
                        {expenseType === "Bank" && (
                          <>
                            <label htmlFor="bank-name">Bank Name: </label>
                            <select
                              name="bank-name"
                              id="bank-name"
                              onChange={handleBankNameChange}
                            >
                              <option value="select" hidden>
                                {bankName}
                              </option>
                              {bankList.map((bank) => (
                                <option value={bank._id} key={bank._id}>
                                  {bank.bankName} - {bank.branchCode}
                                </option>
                              ))}
                            </select>
                            <label htmlFor="purchaseName">
                              Account Number:{" "}
                            </label>
                            <select
                              name="account-number"
                              id="account-number"
                              onChange={handleBankAccountChange}
                            >
                              <option value="select" hidden>
                                Select
                              </option>
                              {bankList
                                .filter((bank) => bank._id === bankName)
                                .map((bank) => (
                                  <option
                                    value={bank.accountNo}
                                    key={bank.accountNo}
                                  >
                                    {bank.accountNo}
                                  </option>
                                ))}
                            </select>
                            <label htmlFor="chequeNo">Cheque No: </label>
                            <input
                              type="text"
                              name="chequeNo"
                              id="chequeNo"
                              value={chequeNo}
                              onChange={(e) => setChequeNo(e.target.value)}
                              required
                            />
                          </>
                        )}
                        <label htmlFor="amount">Amount: </label>
                        <input
                          type="number"
                          name="amount"
                          id="amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                        <label htmlFor="amount">Date: </label>
                        <input
                          type="date"
                          name="date"
                          id="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                        <label htmlFor="amount">Discription: </label>
                        <textarea
                          cols={10}
                          name="description"
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        >
                          {description}
                        </textarea>
                        {SubHeadOfAccount === "Demarcation" && (
                          <>
                            <label htmlFor="plotNumber">Plot Number</label>
                            <input
                              type="text"
                              name="plotNumber"
                              id="plotNumber"
                              value={plotNumber}
                              onChange={handlePlotNumberChange}
                            />
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
                {headOfAccount === "Electricity/Water Connection" && (
                  <>
                    <label htmlFor="subHeadOfConnection">
                      Select Connection:{" "}
                    </label>
                    <select
                      name="subHeadOfConnection"
                      id="subHeadOfConnection"
                      onChange={handleSubHeadOfAccountChange}
                    >
                      <option value="select" hidden>
                        Select
                      </option>
                      {Connection_site_SUBHEADS.map((subHead, index) => (
                        <option key={index} value={subHead}>
                          {subHead}
                        </option>
                      ))}
                    </select>

                    {(SubHeadOfAccount === "Electricity" ||
                      SubHeadOfAccount === "Water Connection") && (
                      <>
                        <label htmlFor="challanno">Challan No: </label>
                        <input
                          type="text"
                          name="challanno"
                          id="challanno"
                          value={challanNo}
                          onChange={(e) => setChallanNo(e.target.value)}
                          required
                        />
                        <label htmlFor="expenseType">Type: </label>
                        <select
                          name="expenseType"
                          id="expenseType"
                          onChange={(e) => setExpenseType(e.target.value)}
                          required
                        >
                          <option value="select" hidden>
                            Select
                          </option>
                          <option value="Cash">Cash</option>
                          <option value="Bank">Bank</option>
                        </select>
                        {expenseType === "Bank" && (
                          <>
                            <label htmlFor="bank-name">Bank Name: </label>
                            <select
                              name="bank-name"
                              id="bank-name"
                              onChange={handleBankNameChange}
                            >
                              <option value="select" hidden>
                                {bankName}
                              </option>
                              {bankList.map((bank) => (
                                <option value={bank._id} key={bank._id}>
                                  {bank.bankName} - {bank.branchCode}
                                </option>
                              ))}
                            </select>
                            <label htmlFor="purchaseName">
                              Account Number:{" "}
                            </label>
                            <select
                              name="account-number"
                              id="account-number"
                              onChange={handleBankAccountChange}
                            >
                              <option value="select" hidden>
                                Select
                              </option>
                              {bankList
                                .filter((bank) => bank._id === bankName)
                                .map((bank) => (
                                  <option
                                    value={bank.accountNo}
                                    key={bank.accountNo}
                                  >
                                    {bank.accountNo}
                                  </option>
                                ))}
                            </select>
                            <label htmlFor="chequeNo">Cheque No: </label>
                            <input
                              type="text"
                              name="chequeNo"
                              id="chequeNo"
                              value={chequeNo}
                              onChange={(e) => setChequeNo(e.target.value)}
                              required
                            />
                          </>
                        )}
                        <label htmlFor="amount">Date: </label>
                        <input
                          type="date"
                          name="date"
                          id="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                        <label htmlFor="amount">Amount: </label>
                        <input
                          type="number"
                          name="amount"
                          id="amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                        <label htmlFor="amount">Discription: </label>
                        <textarea
                          cols={10}
                          name="description"
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        >
                          {description}
                        </textarea>

                        <label htmlFor="vendor">Vendor</label>
                        <input
                          type="text"
                          name="vendor"
                          id="vendor"
                          value={vendor}
                          onChange={handleVendorChange}
                        />
                      </>
                    )}
                  </>
                )}

                <button
                  type="submit"
                  className="blue-button"
                  onSubmit={createNewSiteExpense}
                >
                  Save
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Edit SEction */}
        {editSection && (
          <div className="left-section">
            <div className="left-section-content">
              <div onClick={closeSection} className="close-button"></div>
              <h3>Edit site Expense</h3>
              <div className="horizontal-divider"></div>
              <form onSubmit={EditsiteExpense}>
                <label htmlFor="headOfAccount">Head Of Account: </label>
                <select
                  name="headOfAccount"
                  id="headOfAccount"
                  readOnly
                  className="read-only"
                  onChange={handleHeadOfAccountChange}
                >
                  <option value={headOfAccount} hidden>
                    {headOfAccount}
                  </option>
                </select>

                {headOfAccount === "Salary" && (
                  <>
                    <label htmlFor="bank-name">Bank Name: </label>
                    <select
                      name="bank-name"
                      id="bank-name"
                      readOnly
                      className="read-only"
                      onChange={handleBankNameChange}
                    >
                      <option value="select" hidden>
                        {bankName}
                      </option>
                    </select>
                    <label htmlFor="purchaseName">Account Number: </label>
                    <select
                      name="account-number"
                      id="account-number"
                      readOnly
                      className="read-only"
                      onChange={handleBankAccountChange}
                    >
                      <option value="select" hidden>
                        {bankAccount}
                      </option>
                    </select>
                    <label htmlFor="chequeNumber">Cheque Number: </label>
                    <input
                      type="number"
                      name="chequeNumber"
                      id="chequeNumber"
                      value={chequeNumber}
                      onChange={handleChequeNumberChange}
                    />
                    <label htmlFor="amount">Amount: </label>
                    <input
                      type="number"
                      name="amount"
                      id="amount"
                      value={amount}
                      onChange={handleAmountChange}
                    />
                    <label htmlFor="paidDate">Paid Date: </label>
                    <input
                      type="date"
                      name="paidDate"
                      id="paidDate"
                      value={date}
                      onChange={handleDateChange}
                    />
                  </>
                )}

                {headOfAccount === "Lesco Site" && (
                  <>
                    <label htmlFor="subHeadOfAccount">
                      Sub Head Of Account{" "}
                    </label>
                    <select
                      name="subHeadOfAccount"
                      id="subHeadOfAccount"
                      readOnly
                      className="read-only"
                      onChange={handleSubHeadOfAccountChange}
                    >
                      <option value="select" hidden>
                        {SubHeadOfAccount}
                      </option>
                    </select>
                    {(SubHeadOfAccount === "A Block" ||
                      SubHeadOfAccount === "D Block") && (
                      <>
                        <label htmlFor="billingMonth">Billing Month: </label>
                        <select
                          name="billingMonth"
                          id="billingMonth"
                          value={billingMonth}
                          onChange={handleBillingMonthChange}
                          required
                        >
                          <option value={billingMonth} hidden>
                            {billingMonth}
                          </option>
                        </select>
                        <label htmlFor="advTax">Adv Tax </label>
                        <input
                          type="text"
                          name="advTax"
                          id="advTax"
                          value={advTax}
                          onChange={handleAdvTaxChange}
                        />
                        <label htmlFor="billReference">Bill Reference </label>
                        <input
                          type="number"
                          name="billReference"
                          id="billReference"
                          value={billReference}
                          onChange={handleBillReferenceChange}
                        />
                        <label htmlFor="challanno">Challan No: </label>
                        <input
                          type="text"
                          name="challanno"
                          id="challanno"
                          readOnly
                          className="read-only"
                          value={challanNo}
                          onChange={(e) => setChallanNo(e.target.value)}
                          required
                        />
                        <label htmlFor="expenseType">Type: </label>
                        <select
                          name="expenseType"
                          id="expenseType"
                          value={expenseType}
                          readOnly
                          className="read-only"
                          required
                        >
                          <option value={expenseType} hidden>
                            {expenseType}
                          </option>
                        </select>
                        {expenseType === "Bank" && (
                          <>
                            <label htmlFor="bank-name">Bank Name: </label>
                            <select
                              name="bank-name"
                              id="bank-name"
                              readOnly
                              className="read-only"
                              value={bankName}
                              onChange={handleBankNameChange}
                            >
                              <option value={bankName} hidden>
                                {bankName}
                              </option>
                            </select>
                            <label htmlFor="purchaseName">
                              Account Number:{" "}
                            </label>
                            <select
                              name="account-number"
                              id="account-number"
                              readOnly
                              className="read-only"
                              value={bankAccount}
                              onChange={handleBankAccountChange}
                            >
                              <option value={bankAccount} hidden>
                                {bankAccount}
                              </option>
                            </select>
                            <label htmlFor="chequeNo">Cheque No: </label>
                            <input
                              type="text"
                              name="chequeNo"
                              id="chequeNo"
                              readOnly
                              className="read-only"
                              value={chequeNo}
                              onChange={(e) => setChequeNo(e.target.value)}
                              required
                            />
                          </>
                        )}
                        <label htmlFor="paidDate">Paid Date: </label>
                        <input
                          type="date"
                          name="paidDate"
                          id="paidDate"
                          value={date}
                          onChange={handleDateChange}
                        />
                        <label htmlFor="amount">Amount: </label>
                        <input
                          type="number"
                          name="amount"
                          id="amount"
                          value={amount}
                          onChange={handleAmountChange}
                        />
                      </>
                    )}
                  </>
                )}
                {headOfAccount === "Vehicle/Disposal" && (
                  <>
                    <label htmlFor="subHeadOfAccount">
                      Sub Head Of Account:{" "}
                    </label>
                    <select
                      name="subHeadOfAccount"
                      id="subHeadOfAccount"
                      readOnly
                      className="read-only"
                      onChange={handleSubHeadOfAccountChange}
                    >
                      <option value={SubHeadOfAccount} hidden>
                        {SubHeadOfAccount}
                      </option>
                    </select>

                    {SubHeadOfAccount === "Disposal" && (
                      <>
                        <label htmlFor="fuelLitre">Fuel Litre: </label>
                        <input
                          type="number"
                          name="fuelLitre"
                          id="fuelLitre"
                          value={fuelLitre}
                          onChange={(e) => setFuelLitre(e.target.value)}
                        />
                        <label htmlFor="amount">Amount: </label>
                        <input
                          type="number"
                          name="amount"
                          id="amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                        <label htmlFor="paidDate">Paid Date: </label>
                        <input
                          type="date"
                          name="paidDate"
                          id="paidDate"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                      </>
                    )}

                    {SubHeadOfAccount === "Vehicle" && (
                      <>
                        <label htmlFor="vehichleNumber">Vehicle Number: </label>
                        <input
                          type="number"
                          name="vehichleNumber"
                          id="vehichleNumber"
                          value={vehichleNumber}
                          onChange={(e) => setVehicleNumber(e.target.value)}
                        />
                        <label htmlFor="vehicleType">Vehicle Type: </label>
                        <input
                          type="text"
                          name="vehicleType"
                          id="vehicleType"
                          value={vehicleType}
                          onChange={(e) => setVehicleType(e.target.value)}
                        />
                        <label htmlFor="fuelLitre">Fuel Litre: </label>
                        <input
                          type="number"
                          name="fuelLitre"
                          id="fuelLitre"
                          value={fuelLitre}
                          onChange={(e) => setFuelLitre(e.target.value)}
                        />
                        <label htmlFor="amount">Amount: </label>
                        <input
                          type="number"
                          name="amount"
                          id="amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                        <label htmlFor="paidDate">Paid Date: </label>
                        <input
                          type="date"
                          name="paidDate"
                          id="paidDate"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                      </>
                    )}
                  </>
                )}
                {headOfAccount === "Repair/Maintainance" && (
                  <>
                    <label htmlFor="subHeadOfAccount">Select Phase: </label>
                    <select
                      name="subHeadOfAccount"
                      id="subHeadOfAccount"
                      readOnly
                      className="read-only"
                      onChange={handleSubHeadOfAccountChange}
                    >
                      <option value={SubHeadOfAccount} hidden>
                        {SubHeadOfAccount}
                      </option>
                    </select>
                    {(SubHeadOfAccount === "Phase 1" ||
                      SubHeadOfAccount === "Phase 2") && (
                      <>
                        <label htmlFor="amount">Amount: </label>
                        <input
                          type="number"
                          name="amount"
                          id="amount"
                          value={amount}
                          onChange={handleAmountChange}
                        />
                        <label htmlFor="particular">Particular: </label>
                        <input
                          type="text"
                          name="particular"
                          id="particular"
                          value={particular}
                          onChange={handleParticularChange}
                        />
                        <label htmlFor="challanno">Challan No: </label>
                        <input
                          type="text"
                          name="challanno"
                          readOnly
                          className="read-only"
                          id="challanno"
                          value={challanNo}
                          onChange={(e) => setChallanNo(e.target.value)}
                          required
                        />
                        <label htmlFor="expenseType">Type: </label>
                        <select
                          name="expenseType"
                          id="expenseType"
                          readOnly
                          className="read-only"
                          value={expenseType}
                          onChange={(e) => setExpenseType(e.target.value)}
                          required
                        >
                          <option value={expenseType} hidden>
                            {expenseType}
                          </option>
                        </select>
                        {expenseType === "Bank" && (
                          <>
                            <label htmlFor="bank-name">Bank Name: </label>
                            <select
                              name="bank-name"
                              id="bank-name"
                              readOnly
                              className="read-only"
                              value={bankName}
                              onChange={handleBankNameChange}
                            >
                              <option value={bankName} hidden>
                                {bankName}
                              </option>
                            </select>
                            <label htmlFor="purchaseName">
                              Account Number:{" "}
                            </label>
                            <select
                              name="account-number"
                              readOnly
                              className="read-only"
                              id="account-number"
                              value={bankAccount}
                              onChange={handleBankAccountChange}
                            >
                              <option value={bankAccount} hidden>
                                {bankAccount}
                              </option>
                            </select>
                            <label htmlFor="chequeNo">Cheque No: </label>
                            <input
                              type="text"
                              name="chequeNo"
                              readOnly
                              className="read-only"
                              id="chequeNo"
                              value={chequeNo}
                              onChange={(e) => setChequeNo(e.target.value)}
                              required
                            />
                          </>
                        )}
                        <label htmlFor="date">Date: </label>
                        <input
                          type="date"
                          name="date"
                          id="date"
                          value={date}
                          onChange={handleDateChange}
                        />
                        <label htmlFor="vendor">Vendor</label>
                        <input
                          type="text"
                          name="vendor"
                          id="vendor"
                          value={vendor}
                          onChange={handleVendorChange}
                        />
                      </>
                    )}
                  </>
                )}

                {headOfAccount === "Misc" && (
                  <>
                    <label htmlFor="subHeadOfAccount">
                      Sub Head Of Account:{" "}
                    </label>
                    <select
                      readOnly
                      className="read-only"
                      name="subHeadOfAccount"
                      id="subHeadOfAccount"
                      onChange={handleSubHeadOfAccountChange}
                    >
                      <option value={SubHeadOfAccount} hidden>
                        {SubHeadOfAccount}
                      </option>
                    </select>

                    {(SubHeadOfAccount === "Weapon" ||
                      SubHeadOfAccount === "Dengue" ||
                      SubHeadOfAccount === "Demarcation") && (
                      <>
                        <label htmlFor="challanno">Challan No: </label>
                        <input
                          type="text"
                          name="challanno"
                          id="challanno"
                          readOnly
                          className="read-only"
                          value={challanNo}
                          onChange={(e) => setChallanNo(e.target.value)}
                          required
                        />
                        <label htmlFor="expenseType">Type: </label>
                        <select
                          name="expenseType"
                          id="expenseType"
                          value={expenseType}
                          readOnly
                          className="read-only"
                          required
                        >
                          <option value={expenseType} hidden>
                            {expenseType}
                          </option>
                        </select>
                        {expenseType === "Bank" && (
                          <>
                            <label htmlFor="bank-name">Bank Name: </label>
                            <select
                              name="bank-name"
                              id="bank-name"
                              readOnly
                              className="read-only"
                              value={bankName}
                              onChange={handleBankNameChange}
                            >
                              <option value={bankName} hidden>
                                {bankName}
                              </option>
                            </select>
                            <label htmlFor="purchaseName">
                              Account Number:{" "}
                            </label>
                            <select
                              name="account-number"
                              id="account-number"
                              readOnly
                              className="read-only"
                              value={bankAccount}
                              onChange={handleBankAccountChange}
                            >
                              <option value={bankAccount} hidden>
                                {bankAccount}
                              </option>
                            </select>
                            <label htmlFor="chequeNo">Cheque No: </label>
                            <input
                              type="text"
                              name="chequeNo"
                              id="chequeNo"
                              readOnly
                              className="read-only"
                              value={chequeNo}
                              onChange={(e) => setChequeNo(e.target.value)}
                              required
                            />
                          </>
                        )}
                        <label htmlFor="amount">Amount: </label>
                        <input
                          type="number"
                          name="amount"
                          id="amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                        <label htmlFor="amount">Date: </label>
                        <input
                          type="date"
                          name="date"
                          id="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                        <label htmlFor="amount">Discription: </label>
                        <textarea
                          cols={10}
                          name="description"
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        >
                          {description}
                        </textarea>
                        {SubHeadOfAccount === "Demarcation" && (
                          <>
                            <label htmlFor="plotNumber">Plot Number</label>
                            <input
                              type="text"
                              name="plotNumber"
                              id="plotNumber"
                              value={plotNumber}
                              onChange={handlePlotNumberChange}
                            />
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
                {headOfAccount === "Electricity/Water Connection" && (
                  <>
                    <label htmlFor="subHeadOfConnection">
                      Select Connection:{" "}
                    </label>
                    <select
                      name="subHeadOfConnection"
                      readOnly
                      className="read-only"
                      id="subHeadOfConnection"
                      onChange={handleSubHeadOfAccountChange}
                    >
                      <option value={SubHeadOfAccount} hidden>
                        {SubHeadOfAccount}
                      </option>
                    </select>

                    {(SubHeadOfAccount === "Electricity" ||
                      SubHeadOfAccount === "Water Connection") && (
                      <>
                        <label htmlFor="challanno">Challan No: </label>
                        <input
                          type="text"
                          readOnly
                          className="read-only"
                          name="challanno"
                          id="challanno"
                          value={challanNo}
                          onChange={(e) => setChallanNo(e.target.value)}
                          required
                        />
                        <label htmlFor="expenseType">Type: </label>
                        <select
                          readOnly
                          className="read-only"
                          name="expenseType"
                          id="expenseType"
                          value={expenseType}
                          required
                        >
                          <option value={expenseType} hidden>
                            {expenseType}
                          </option>
                        </select>
                        {expenseType === "Bank" && (
                          <>
                            <label htmlFor="bank-name">Bank Name: </label>
                            <select
                              name="bank-name"
                              readOnly
                              className="read-only"
                              id="bank-name"
                              value={bankName}
                              onChange={handleBankNameChange}
                            >
                              <option value={bankName} hidden>
                                {bankName}
                              </option>
                            </select>
                            <label htmlFor="purchaseName">
                              Account Number:{" "}
                            </label>
                            <select
                              name="account-number"
                              readOnly
                              className="read-only"
                              id="account-number"
                              value={bankAccount}
                              onChange={handleBankAccountChange}
                            >
                              <option value={bankAccount} hidden>
                                {bankAccount}
                              </option>
                            </select>
                            <label htmlFor="chequeNo">Cheque No: </label>
                            <input
                              type="text"
                              readOnly
                              className="read-only"
                              name="chequeNo"
                              id="chequeNo"
                              value={chequeNo}
                              onChange={(e) => setChequeNo(e.target.value)}
                              required
                            />
                          </>
                        )}
                        <label htmlFor="amount">Amount: </label>
                        <input
                          type="number"
                          name="amount"
                          id="amount"
                          value={amount}
                          onChange={handleAmountChange}
                        />
                        <label htmlFor="description">Description: </label>
                        <textarea
                          cols={10}
                          name="description"
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        >
                          {description}
                        </textarea>
                        <label htmlFor="date">Date: </label>
                        <input
                          type="date"
                          name="date"
                          id="date"
                          value={date}
                          onChange={handleDateChange}
                        />
                        <label htmlFor="vendor">Vendor</label>
                        <input
                          type="text"
                          name="vendor"
                          id="vendor"
                          value={vendor}
                          onChange={handleVendorChange}
                        />
                      </>
                    )}
                  </>
                )}
                <button
                  type="submit"
                  className="blue-button"
                  onSubmit={EditsiteExpense}
                >
                  Save
                </button>
                {isLoading && (
                  <div className="loading-indicator">
                    <div className="spinner"></div>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </>
  );
}

export default SiteExpenseComponent;
