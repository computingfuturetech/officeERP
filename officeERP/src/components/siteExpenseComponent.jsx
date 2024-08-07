import React from 'react';
import { useEffect, useState, useRef } from 'react';
import './style/memberListStyle.css';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { showErrorToastMessage, showSuccessToastMessage } from './toastUtils';
import { ToastContainer } from 'react-toastify';


function SiteExpenseComponent() {
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [siteExpensesList, setsiteExpensesList] = useState([]);
  const membersRef = useRef(null);
  const [showOptions, setShowOptions] = useState(false);
  const [page, setPage] = useState(1);
  const [editSection, setEditSection] = useState(false);
  const [addNew, setAddNew] = useState(false);
  const [amount, setAmount] = useState('');
  const [particular, setParticular] = useState('');
  const [vendor, setVendor] = useState('');
  const [date,setDate]=useState("")
  const [headOfAccount,setHeadOfAccount]=useState("")
  const [SubHeadOfAccount,setSubHeadOfAccount]=useState("")
  const Expenses = ['Utility', 'Rent', 'Advertisement', 'Legal/Professional', 'Audit'];
  const SubHeads = ['Lesco'];
  const [plotNumber,setPlotNumber]=useState("")

  const MISC_site_SUBHEADS=['Dengue','Weapon','Demarcation']
  const Connection_site_SUBHEADS=['Electricity','Water']
  const Repair_site_SUBHEADS=['Phase 1','Phase 2']
  const Sub_Lesco_Heads=['Block A','Block D']
  const Sub_Disposal_Heads=['Disposal','Vehicle']
  const HEADOFACCOUNTLIST = ['Salary','Utility','Vehicle/Disposal','Eletricity/Water Connection','Repair/Maintainance','Misc'];
  const [HeadOfAccountssiteList,setHeadOfAccountssiteList]=useState([])
  const [billingMonth, setBillingMonth] = useState('');
  const [advTax, setAdvTax] = useState('');
  const [billReference, setBillReference] = useState('');
  const [employeeName,setEmployeeName]=useState("")
  const [fuelLitre, setFuelLitre] = useState('');
  const [vehichleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [taxConsultantName, setTaxConsultantName] = useState('');
  const [auditFee,setAuditFeeChange]=useState("")
  const [auditYear,setAuditYear]=useState("")
  const [description,setDescription]=useState("")
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [chequeNumber,setChequeNumber]=useState("")
  const [lescoSubHead,setLescoSubHead]=useState("")
  const [bankList,setBankList]=useState('')

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const config = {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token'),
          },
        };
        const response = await axios.get(process.env.REACT_APP_API_URL + '/user/getAllExpense?expense_type=Site%20Expense', config);
        setsiteExpensesList(response.data);
        // console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBanks();
  }, []);

  useEffect(() => {
    const fetchHeadOfAccounts = async () => {
      try {
        const config = {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token'),
          },
        };
        const response = await axios.get(process.env.REACT_APP_API_URL + '/user/listOfHeadOfAccount?expense_type=Site%20Expense', config);
        setHeadOfAccountssiteList(response.data);
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchHeadOfAccounts();
  }, []);

  useEffect(() => {
    if (membersRef.current) {
      membersRef.current.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (membersRef.current) {
        membersRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [loading]);

  useEffect(() => {
    const fetchBanks= async() =>{
      try {
        const config = {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
      }
      const response=await axios.get(
        `http://192.168.0.189:3001/user/bankList`,
        config
      )
      setBankList(response.data)
    }
    catch(error){
      console.error(error);
    }
  }
  fetchBanks()
}, []);
  const handleExpenseChange = () => {};

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

  const handleEmployeeNameChange = (e) => {
    setEmployeeName(e.target.value);
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
  const handleAuditFeeChange= (e) => {
    setAuditFeeChange(e.target.value);
  };
  const handleBankAccountChange = (e) => setBankAccount(e.target.value);
  const handleBankNameChange = (e) => setBankName(e.target.value);

  const createNewSiteExpense = (e) => {
    e.preventDefault();
    let data = {};
    let url = '';

    switch (headOfAccount) {
        case 'Utility':
            switch (SubHeadOfAccount) {
                case 'Lesco':
                    switch (lescoSubHead) {
                        case 'Block A':
                            url = '/user/createOfficeUtilExpense';
                            data = { head_of_account: 'A Block', bill_reference: billReference, amount: amount, billing_month: billingMonth, paid_date: date, adv_tax: advTax };
                            break;
                        case 'Block D':
                            url = '/user/createOfficeUtilExpense';
                            data = { head_of_account: 'D Block', bill_reference: billReference, amount: amount, billing_month: billingMonth, paid_date: date, adv_tax: advTax };
                            break;
                        default:
                            return;
                    }
                    break;
                default:
                    return;
            }
            break;
        case 'Salary':
            url = '/user/createSalary';
            data = { salary_type:"Site",head_of_account: 'Salaries Site Employees',cheque_no:chequeNumber,amount:amount,bank_account:bankAccount,paid_date:date};
            break;

        case 'Vehicle/Disposal':
            switch (SubHeadOfAccount) {
                case 'Disposal':
                  url = '/user/createVehicleDisposal';
                    data = { head_of_account: "Disposal", amount: amount,  paid_date: date, fuel_litre:fuelLitre };
                    break;
                case 'Vehicle':
                    url = '/user/createVehicleDisposal';
                    data = { head_of_account: "Vehicle", amount: amount, vehicle_number:vehichleNumber, vehicle_type:vehicleType,paid_date: date,fuel_litre:fuelLitre  };
                    break;
                default:
                    return;
            }
            break;

        case 'Eletricity/Water Connection':
            switch (SubHeadOfAccount) {

                case 'Electricity':
                  url = '/user/createElectricityWaterExpense';
                    data = { head_of_account: SubHeadOfAccount, amount: amount,  particular: particular, paid_date: date, vendor: vendor };
                case 'Water':
                    url = '/user/createElectricityWaterExpense';
                    data = { head_of_account: SubHeadOfAccount, amount: amount, particular: particular, paid_date: date, vendor: vendor };
                    break;
                default:
                    return;
            }
            break;

        case 'Repair/Maintainance':
          console.log(SubHeadOfAccount)
            switch (SubHeadOfAccount) {
              
                case 'Phase 1':
                  url = '/user/createLegalProfessionalExpense';
                  data = { head_of_account:"Phase 1", amount: amount,  particular: particular, paid_date: date, vendor: vendor };
                  break;
                case 'Phase 2':
                    url = '/user/createLegalProfessionalExpense';
                    data = { head_of_account:"Phase 2", amount: amount, particular: particular, paid_date: date, vendor: vendor };
                    break;
                default:
                    return;
            }
            break;

        case 'Misc':
            switch (SubHeadOfAccount) {
                case 'Dengue':
                  url = '/user/createMiscellaneousExpense';
                    data = { head_of_account: SubHeadOfAccount, amount: amount,  paid_date: date, description: description };
                    break;
                case 'Weapon':
                  url = '/user/createMiscellaneousExpense';
                    data = { head_of_account: SubHeadOfAccount, amount: amount, plot_number: plotNumber, paid_date: date, description: description,vendor:vendor };
                    break;
                case 'Demarcation':
                  url = '/user/createMiscellaneousExpense';
                    data = { head_of_account: SubHeadOfAccount, amount: amount,  paid_date: date, description: description };
                    break;
                default:
                    return;
            }
            break;

        default:
            return;
    }

    const createExpense = async () => {
        console.log(data);
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
            console.log(response.data);
            showSuccessToastMessage("Expense Is Added Successfully")
            setAmount("")
            setDate("")
            setAdvTax("")
            setAuditFeeChange("")
            setAuditYear("")
            setBankAccount("")
            setBankName("")
            setBillingMonth("")
            setDescription("")
            setEmployeeName("")
            setParticular("")
            setVendor("")
            setFuelLitre("")
            setVehicleNumber("")
            setVehicleType("")
            closeSection();
        } catch (error) {
            console.error(error);
            showErrorToastMessage("Error Please Try Again!")
        }
    };
    createExpense();
};

  const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
  
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
  
    return [year, month, day].join('-');
  };
  const handleDescriptionChange=(e)=>{
    setDescription(e.target.value)
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  
  };
  const handleAuditYearChange=(e)=>{
    setAuditYear(e)
  }
  const handleParticularChange=(e)=>{
    setParticular(e.target.value)
  }
  const handleVendorChange=(e)=>{
    setVendor(e.target.value)
  }
  const handleHeadOfAccountChange=(e)=>{
    setHeadOfAccount(e.target.value)
    setAmount("")
    setDate("")
    setAdvTax("")
    setAuditFeeChange("")
    setAuditYear("")
    setBankAccount("")
    setBankName("")
    setBillingMonth("")
    setDescription("")
    setEmployeeName("")
    setParticular("")
    setVendor("")
    setFuelLitre("")
    setVehicleNumber("")
    setVehicleType("")

  }
  const handleEditSection = (member) => {
    setSelectedMember(member);
    setParticular(member.particulor);
    setAmount(member.amount)
    setDate(formatDate(member.paidDate))
    setVendor(member.vendor)
    setHeadOfAccount(member.headOfAccount)
    setEditSection(true);
    setShowOptions(false);
  };

  const handleShowOptions = (member) => {
    setSelectedMember(member);
    setShowOptions(!showOptions);
  };

  const closeSection = () => {
    setAddNew(false);
    setAmount('');
    setEditSection(false);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleScroll = () => {
    console.log('scrolling');
    if (membersRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = membersRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 50 && !loading) {
        setPage((prevPage) => prevPage + 1);
      }
    }
  };
  const handleSubHeadOfAccountChange=(e)=>{
    setSubHeadOfAccount(e.target.value)
  }
  const EditsiteExpense=()=>{
    e.preventDefault();
    const data = {
      head_of_account: headOfAccount,
      particulor: particular,
      amount:amount,
      paid_date: date,
      vendor:vendor
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
          process.env.REACT_APP_API_URL+`/user/updatesiteExpense`,
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
  }
  const handleChequeNumberChange=(e)=>{
    setChequeNumber(e.target.value)
  }
  const handleLescoSubHeadChange=(e)=>{
    setLescoSubHead(e.target.value)
  }
  return (
    <>
      <div className="member-list">
        <div className="title">
          <h2>Site Expense</h2>
          <div className="title-buttons">
            <form className="nosubmit">
              <input
                className="nosubmit"
                name="search-members"
                id="search-members"
                type="search"
                placeholder="Search..."
              />
            </form>
            <button className="blue-button" onClick={handleAddNew}>Add New</button>
            <button className="simple-button" onClick={handleRefresh}>Refresh</button>
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
<div className={`members ${loading ? 'loading' : ''}`} ref={membersRef}>
          {siteExpensesList.map((member) => (
            <div className="member" key={member._id}>
              <div className="member-details">
              <p>
            {member.mainHeadOfAccount ? member.mainHeadOfAccount.headOfAccount : member.subHeadOfAccount?.headOfAccount}</p>
                <p>{member.paidDate}</p>
                <p>{member.amount}</p>
                <img
                  onClick={() => handleShowOptions(member)}
                  src="data:image/svg+xml,%3Csvg width='800px' height='800px' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:%23231f20;stroke:null;stroke-linecap:round;stroke-linejoin:round;stroke-width:2px;%7D%3C/style%3E%3C/defs%3E%3Cg id='more'%3E%3Ccircle class='cls-1' cx='16' cy='16' r='2'/%3E%3Ccircle class='cls-1' cx='6' cy='16' r='2'/%3E%3Ccircle class='cls-1' cx='26' cy='16' r='2'/%3E%3C/g%3E%3C/svg%3E"
                  alt="Member Icon"
                />
              </div>
              {selectedMember === member && showOptions && (
                <div className="options income">
                  <button onClick={() => handleEditSection(member)}>Edit</button>
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
        <select name="headOfAccount" id="headOfAccount" onChange={handleHeadOfAccountChange}>
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
    <select name="bank-name" id="bank-name" onChange={handleBankNameChange}>
     <option value="select" hidden>{bankName}</option>
                {bankList.map((bank) => (
                    <option value={bank._id} key={bank._id}>{bank.bankName} - {bank.branchCode}</option>
                  ))}
              </select>
              <label htmlFor="purchaseName">Account Number: </label>
              <select name="account-number" id="account-number" onChange={handleBankAccountChange}>
              <option value="select" hidden>Select</option>
              {bankList
                .filter((bank) => bank._id === bankName)
                .map((bank) => (
                  <option value={bank.accountNo} key={bank.accountNo}>{bank.accountNo}</option>
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

        {headOfAccount === "Utility" && (
          <>
            <label htmlFor="subHeadOfAccount">Sub Head Of Account </label>
            <select name="subHeadOfAccount" id="subHeadOfAccount" onChange={handleSubHeadOfAccountChange}>
              <option value="select" hidden>
                {SubHeadOfAccount}
              </option>
              {SubHeads.map((expense, index) => (
                <option key={index} value={expense}>
                  {expense}
                </option>
              ))}
            </select>
            {SubHeadOfAccount === "Lesco" && (
              <>
              <label htmlFor="lescoSubHead">Select Block: </label>
            <select name="lescoSubHead" id="lescoSubHead" onChange={handleLescoSubHeadChange}>
              <option value="select" hidden>
                {lescoSubHead}
              </option>
              {Sub_Lesco_Heads.map((expense, index) => (
                <option key={index} value={expense}>
                  {expense}
                </option>
              ))}
            </select>

              {lescoSubHead === "Block A"}

                <label htmlFor="billingMonth">Billing Month </label>
                <input
                  type="text"
                  name="billingMonth"
                  id="billingMonth"
                  value={billingMonth}
                  onChange={handleBillingMonthChange}
                />
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
                  type="text"
                  name="billReference"
                  id="billReference"
                  value={billReference}
                  onChange={handleBillReferenceChange}
                />
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
        <label htmlFor="subHeadOfAccount">Sub Head Of Account: </label>
        <select name="subHeadOfAccount" id="subHeadOfAccount" onChange={handleSubHeadOfAccountChange}>
          <option value="select" hidden>
            Select
          </option>
          {Sub_Disposal_Heads.map((subHead, index) => (
            <option key={index} value={subHead}>
              {subHead}
            </option>
          ))}
        </select>
      
        {SubHeadOfAccount === 'Disposal' && (
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

      {SubHeadOfAccount === 'Vehicle' && (
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
        <select name="subHeadOfAccount" id="subHeadOfAccount" onChange={handleSubHeadOfAccountChange}>
          <option value="select" hidden>
            Select
          </option>
          {Repair_site_SUBHEADS.map((subHead, index) => (
            <option key={index} value={subHead}>
              {subHead}
            </option>
          ))}
        </select>
      
        {SubHeadOfAccount === 'Phase 1' && (
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

      {SubHeadOfAccount === 'Phase 2' && (
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
              <label htmlFor="subHeadOfAccount">Sub Head Of Account: </label>
              <select name="subHeadOfAccount" id="subHeadOfAccount" onChange={handleSubHeadOfAccountChange}>
                <option value="select" hidden>
                  Select
                </option>
                {MISC_site_SUBHEADS.map((subHead, index) => (
                  <option key={index} value={subHead}>
                    {subHead}
                  </option>
                ))}
              </select>
              
              {SubHeadOfAccount === 'Weapon' && (
                <>
                 <label htmlFor="amount">Amount: </label>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  /><label htmlFor="amount">Date: </label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
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
                {SubHeadOfAccount === 'Demarcation' && (
                <>
                  <label htmlFor="amount">Amount: </label>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  /><label htmlFor="amount">Date: </label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  <label htmlFor="amount">Discription: </label>
                  <input
                    type="text"
                    name="description"
                    id="discription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  /></>
                )}
                {SubHeadOfAccount === 'Dengue' && (
                <>
                  <label htmlFor="amount">Amount: </label>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  /><label htmlFor="amount">Date: </label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  <label htmlFor="amount">Discription: </label>
                  <input
                    type="text"
                    name="description"
                    id="discription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  /></>
                )}
            
          </>
        )}
        {headOfAccount === "Eletricity/Water Connection" && (
        <>
        <label htmlFor="subHeadOfConnection">Select Coonection: </label>
        <select name="subHeadOfConnection" id="subHeadOfConnection" onChange={handleSubHeadOfAccountChange}>
          <option value="select" hidden>
            Select
          </option>
          {Connection_site_SUBHEADS.map((subHead, index) => (
            <option key={index} value={subHead}>
              {subHead}
            </option>
          ))}
        </select>
      
        {SubHeadOfAccount === 'Electricity' && (
          <>
           <label htmlFor="amount">Amount: </label>
            <input
              type="number"
              name="amount"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
            />
            <label htmlFor="description">Description: </label>
            <input
              type="text"
              name="description"
              id="description"
              value={description}
              onChange={handleDescriptionChange}
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

      {SubHeadOfAccount === 'Water' && (
        <>
 <label htmlFor="amount">Amount: </label>
            <input
              type="number"
              name="amount"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
            />
             <label htmlFor="description">Description: </label>
            <input
              type="text"
              name="description"
              id="description"
              value={description}
              onChange={handleDescriptionChange}
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



        <button type="submit" className="blue-button" onSubmit={createNewSiteExpense}>
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
        <select name="headOfAccount" id="headOfAccount" onChange={handleHeadOfAccountChange}>
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
    <select name="bank-name" id="bank-name" onChange={handleBankNameChange}>
     <option value="select" hidden>{bankName}</option>
                {bankList.map((bank) => (
                    <option value={bank._id} key={bank._id}>{bank.bankName} - {bank.branchCode}</option>
                  ))}
              </select>
              <label htmlFor="purchaseName">Account Number: </label>
              <select name="account-number" id="account-number" onChange={handleBankAccountChange}>
              <option value="select" hidden>Select</option>
              {bankList
                .filter((bank) => bank._id === bankName)
                .map((bank) => (
                  <option value={bank.accountNo} key={bank.accountNo}>{bank.accountNo}</option>
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

        {headOfAccount === "Utility" && (
          <>
            <label htmlFor="subHeadOfAccount">Sub Head Of Account </label>
            <select name="subHeadOfAccount" id="subHeadOfAccount" onChange={handleSubHeadOfAccountChange}>
              <option value="select" hidden>
                {SubHeadOfAccount}
              </option>
              {SubHeads.map((expense, index) => (
                <option key={index} value={expense}>
                  {expense}
                </option>
              ))}
            </select>
            {SubHeadOfAccount === "Lesco" && (
              <>
              <label htmlFor="lescoSubHead">Select Block: </label>
            <select name="lescoSubHead" id="lescoSubHead" onChange={handleLescoSubHeadChange}>
              <option value="select" hidden>
                {lescoSubHead}
              </option>
              {Sub_Lesco_Heads.map((expense, index) => (
                <option key={index} value={expense}>
                  {expense}
                </option>
              ))}
            </select>

              {lescoSubHead === "Block A"}

                <label htmlFor="billingMonth">Billing Month </label>
                <input
                  type="text"
                  name="billingMonth"
                  id="billingMonth"
                  value={billingMonth}
                  onChange={handleBillingMonthChange}
                />
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
                  type="text"
                  name="billReference"
                  id="billReference"
                  value={billReference}
                  onChange={handleBillReferenceChange}
                />
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
        <label htmlFor="subHeadOfAccount">Sub Head Of Account: </label>
        <select name="subHeadOfAccount" id="subHeadOfAccount" onChange={handleSubHeadOfAccountChange}>
          <option value="select" hidden>
            Select
          </option>
          {Sub_Disposal_Heads.map((subHead, index) => (
            <option key={index} value={subHead}>
              {subHead}
            </option>
          ))}
        </select>
      
        {SubHeadOfAccount === 'Disposal' && (
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

      {SubHeadOfAccount === 'Vehicle' && (
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
        <select name="subHeadOfAccount" id="subHeadOfAccount" onChange={handleSubHeadOfAccountChange}>
          <option value="select" hidden>
            Select
          </option>
          {Repair_site_SUBHEADS.map((subHead, index) => (
            <option key={index} value={subHead}>
              {subHead}
            </option>
          ))}
        </select>
      
        {SubHeadOfAccount === 'Phase 1' && (
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

      {SubHeadOfAccount === 'Phase 2' && (
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
              <label htmlFor="subHeadOfAccount">Sub Head Of Account: </label>
              <select name="subHeadOfAccount" id="subHeadOfAccount" onChange={handleSubHeadOfAccountChange}>
                <option value="select" hidden>
                  Select
                </option>
                {MISC_site_SUBHEADS.map((subHead, index) => (
                  <option key={index} value={subHead}>
                    {subHead}
                  </option>
                ))}
              </select>
              
              {SubHeadOfAccount === 'Weapon' && (
                <>
                 <label htmlFor="amount">Amount: </label>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  /><label htmlFor="amount">Date: </label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
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
                {SubHeadOfAccount === 'Demarcation' && (
                <>
                  <label htmlFor="amount">Amount: </label>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  /><label htmlFor="amount">Date: </label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  <label htmlFor="amount">Discription: </label>
                  <input
                    type="text"
                    name="description"
                    id="discription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  /></>
                )}
                {SubHeadOfAccount === 'Dengue' && (
                <>
                  <label htmlFor="amount">Amount: </label>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  /><label htmlFor="amount">Date: </label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  <label htmlFor="amount">Discription: </label>
                  <input
                    type="text"
                    name="description"
                    id="discription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  /></>
                )}
            
          </>
        )}
        {headOfAccount === "Eletricity/Water Connection" && (
        <>
        <label htmlFor="subHeadOfConnection">Select Coonection: </label>
        <select name="subHeadOfConnection" id="subHeadOfConnection" onChange={handleSubHeadOfAccountChange}>
          <option value="select" hidden>
            Select
          </option>
          {Connection_site_SUBHEADS.map((subHead, index) => (
            <option key={index} value={subHead}>
              {subHead}
            </option>
          ))}
        </select>
      
        {SubHeadOfAccount === 'Electricity' && (
          <>
           <label htmlFor="amount">Amount: </label>
            <input
              type="number"
              name="amount"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
            />
            <label htmlFor="description">Description: </label>
            <input
              type="text"
              name="description"
              id="description"
              value={description}
              onChange={handleDescriptionChange}
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

      {SubHeadOfAccount === 'Water' && (
        <>
 <label htmlFor="amount">Amount: </label>
            <input
              type="number"
              name="amount"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
            />
             <label htmlFor="description">Description: </label>
            <input
              type="text"
              name="description"
              id="description"
              value={description}
              onChange={handleDescriptionChange}
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
            <button type="submit" className="blue-button" onSubmit={EditsiteExpense}>
              Save
            </button>
          </form>
        </div>
      </div>
      )}
      </div>
      <ToastContainer/>
    </>
  );
}

export default SiteExpenseComponent;
