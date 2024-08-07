import React from 'react';
import { useEffect, useState, useRef } from 'react';
import './style/memberListStyle.css';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { showErrorToastMessage, showSuccessToastMessage } from './toastUtils';
import { ToastContainer } from "react-toastify";
import Loading from './loading';


function OfficeExpenseComponent() {
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [officeExpensesList, setOfficeExpensesList] = useState([]);
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
  const SubHeads = ['Lesco', 'Telephone', 'Sui Gas', 'Water'];
  const MISC_OFFICE_SUBHEADS=['Misc','TA/DA']
  const LEGAL_PROFESSIONAL_SUBHEADS = [
    'Legal',
    'Accounts Consultant',
    'Billing Software',
    'Tax Consultant'
  ];
  
  const HEADOFACCOUNTLIST = ['Salary','Utility','Printing/Stationary','Legal/Professional', 'Audit','News Paper/Periodicals','Rent Rate/Taxes','Advertisement','Repair/Maintenance','Bank Charges Expense','Misc'];
  const [HeadOfAccountsOfficeList,setHeadOfAccountsOfficeList]=useState([])
  const [billingMonth, setBillingMonth] = useState('');
  const [advTax, setAdvTax] = useState('');
  const [billReference, setBillReference] = useState('');
  const [employeeName,setEmployeeName]=useState("")
  const [legalName, setLegalName] = useState('');
  const [consultantName, setConsultantName] = useState('');
  const [softwareName, setSoftwareName] = useState('');
  const [taxConsultantName, setTaxConsultantName] = useState('');
  const [auditFee,setAuditFeeChange]=useState("")
  const [auditYear,setAuditYear]=useState("")
  const [description,setDescription]=useState("")
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankList,setBankList]=useState('')
  const [selectedAccount, setSelectedAccount] = useState("");
  const [expenseId,setExpenseId]=useState("")
  const [isLoading, setIsLoading] = useState(false);


  const fetchBanks = async () => {
    try {
      const config = {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      };
      const response = await axios.get(process.env.REACT_APP_API_URL + '/user/getAllExpense?expense_type=Office%20Expense', config);
      setOfficeExpensesList(response.data);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

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

  useEffect(() => {
    const fetchHeadOfAccounts = async () => {
      try {
        const config = {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token'),
          },
        };
        const response = await axios.get(process.env.REACT_APP_API_URL + '/user/listOfHeadOfAccount?expense_type=Office%20Expense', config);
        setHeadOfAccountsOfficeList(response.data);
        // console.log(response.data);
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
  const convertDate=(e)=>{
    const dateValue = new Date(e).toISOString().split('T')[0];
    return dateValue;
  }
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
  const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
  
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
  
    return [year, month, day].join('-');
  };


  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  
  };
  const handleAuditYearChange=(e)=>{
    // const year = e.getFullYear();
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

  }



  const handleEditSection = async (member) => {
    setIsLoading(true)
    scrollToTop()
    setSelectedMember(member);

    const mainId=member._id;
    setExpenseId(mainId);
    const headOfAccountId = member.mainHeadOfAccount?._id || member.subHeadOfAccount?._id;
    console.log(headOfAccountId)

    try {
      const config = {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      };
      const response = await axios.get(process.env.REACT_APP_API_URL + `/user/getSingleExpense?headOfAccountId=${headOfAccountId}&mainId=${mainId}`, config);
      console.log(response)
      const expenseData = response.data;
      let headOfAccountValue=expenseData.mainHeadOfAccount ? expenseData.mainHeadOfAccount.headOfAccount : expenseData.subHeadOfAccount.headOfAccount
      console.log("Head of Account", headOfAccountValue)
      if(expenseData.subHeadOfAccount){
        const headMapping = {
          'TA/DA': 'Misc',
          'Misc': 'Misc',
          'Water': 'Utility',
          'Gas': 'Utility',
          'Telephone': 'Utility',
          'Lesco':'Utility',
          'IT Billing': 'Legal/Professional',
          'Tax Consultant': 'Legal/Professional'
      };

      const subHeadMapping = {
          'TA/DA': 'TA/DA',
          'Misc': 'Misc',
          'Water': 'Water',
          'Telephone':'Telephone',
          'Gas': 'Sui Gas',
          'IT Billing': 'Billing Software',
          'Tax Consultant': 'Tax Consultant'
      };
      headOfAccountValue = headMapping[headOfAccountValue] || headOfAccountValue;
      setSubHeadOfAccount(subHeadMapping[expenseData.subHeadOfAccount?.headOfAccount] || expenseData.subHeadOfAccount?.headOfAccount);
      console.log("The subhead set is : ",SubHeadOfAccount)
      console.log("The head set is : ",headOfAccount)
      }
      setHeadOfAccount(headOfAccountValue);
      if(headOfAccountValue==="Bank Charges")
        setHeadOfAccount("Bank Charges Expense")
      if(headOfAccountValue==="Printing And Stationary")
        setHeadOfAccount("Printing/Stationary")
      if(headOfAccountValue==="Salaries Office Employees")
        setHeadOfAccount("Salary")
      // setSubHeadOfAccount(expenseData.mainHeadOfAccount.headOfAccount);
      console.log(headOfAccountValue)
      setAmount(expenseData.amount);
      setParticular(expenseData.particulor );
      setDate(convertDate(expenseData.paidDate));
      setVendor(expenseData.vendor);
      setEmployeeName(expenseData.employeeName );
      setBillingMonth(expenseData.billingMonth );
      setAdvTax(expenseData.advTax);
      setBillReference(expenseData.billReference );
      setAuditYear(expenseData.year);
      setLegalName(expenseData.legalName );
      setDescription(expenseData.description );
      if(expenseData.bank){
        setBankAccount(expenseData.bank.accountNo)
      setBankName(expenseData.bank.bankName );
      }
      setBankAccount(expenseData.bank)
      setBankName(expenseData.bankName );
      
    } catch (error) {
      console.error("Error fetching expense data:", error);
      closeSection()
      showErrorToastMessage("Error Occured Try Again!")
      setIsLoading(false)
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
    setAmount('');
    setDate("")
        setAdvTax("")
        setAuditFeeChange("")
        setAuditYear("")
        setBankAccount("")
        setBankName("")
        setHeadOfAccount("")
        setSubHeadOfAccount("")
        setBillingMonth("")
        setDescription("")
        setEmployeeName("")
        setParticular("")
        setVendor("")
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


  // Api Integration For Expense Creation

  const createNewOfficeExpense = (e) => {
    e.preventDefault();
    let data = {};
    let url = '';

    switch (headOfAccount) {
      case 'Utility':
        switch (SubHeadOfAccount) {
          case 'Water':
            url = '/user/createOfficeUtilExpense';
            data = {head_of_account:'Water' ,bill_reference:billReference, amount:amount, billing_month:billingMonth, paid_date:date };
            break;
          case 'Lesco':
            url = '/user/createOfficeUtilExpense';
            data = {head_of_account:'Lesco', bill_reference:billReference, amount:amount, billing_month:billingMonth, paid_date:date,adv_tax:advTax };
            break;
          case 'Telephone':
            url = '/user/createOfficeUtilExpense';
            data = {head_of_account:'Telephone' ,bill_reference:billReference, amount:amount, billing_month:billingMonth, paid_date:date,adv_tax:advTax};
            break;
          case 'Sui Gas':
            url = '/user/createOfficeUtilExpense';
            data = {head_of_account:'Gas', bill_reference:billReference, amount:amount, billing_month:billingMonth, paid_date:date };
            break;  
          default:
            return;
        }
        break;
        case 'Bank Charges Expense':
          url = '/user/createBankExpense';
          data = { amount:amount, bank_account: bankAccount, head_of_account:"Bank Charges",paid_date:date };
          break;
    
        case 'Legal/Professional':
          switch (SubHeadOfAccount) {
            case 'Legal':
              url = '/user/createLegalProfessionalExpense';
              data = { head_of_account:"Legal",legal_name: legalName };
              break;
            case 'Accounts Consultant':
              url = '/user/createLegalProfessionalExpense';
              data = { head_of_account:"Account and Consultant" , amount:amount, particulor:particular, paid_date:date, vendor:vendor};
              break;
            case 'Billing Software':
              url = '/user/createLegalProfessionalExpense';
              data = {head_of_account:"IT Billing", amount:amount, particulor:particular, paid_date:date, vendor:vendor};
              break;
            case 'Tax Consultant':
              url = '/user/createLegalProfessionalExpense';
              data = { head_of_account:"Tax Consultant",amount:amount, particulor:particular, paid_date:date, vendor:vendor};
              break;
            default:
              return;
          }
          break;
    
        case 'Salary':
          url = '/user/createSalary';
          data = { salary_type:"Office",employee_name: employeeName, amount:amount,paid_date:date,head_of_account:"Salaries Office Employees",bank_account:bankAccount };
          break;
    
        case 'Printing/Stationary':
          url = '/user/createOfficeExpense';
          data = {head_of_account: "Printing And Stationary", amount:amount, particulor:particular, paid_date:date, vendor:vendor };
          break;
    
        case 'News Paper/Periodicals':
          url = '/user/createOfficeExpense';
          data = { head_of_account:"Newspaper",amount:amount, particulor:particular, paid_date:date, vendor:vendor};
          break;
    
        case 'Rent Rate/Taxes':
          url = '/user/createOfficeExpense';
          data = { head_of_account:"Rent Rate/Taxes",amount:amount, particulor:particular, paid_date:date, vendor:vendor };
          break;
    
        case 'Advertisement':
          url = '/user/createOfficeExpense';
          data = {head_of_account:"Advertisement", amount, particulor: particular, paid_date:date, vendor:vendor };
          break;
    
        case 'Repair/Maintenance':
          url = '/user/createLegalProfessionalExpense';
          data = { head_of_account:"Office Repair/Maintenance",amount:amount, particulor:particular, paid_date:date, vendor:vendor};
          break;
    
        case 'Audit':
          url = '/user/createAuditExpense';
          data = { year: auditYear.getFullYear(), amount:amount, paid_date:date,head_of_account:"Audit" };
          break;

        case 'Misc':
          switch (SubHeadOfAccount) {
            case 'Misc':
              url = '/user/createMiscellaneousExpense';
              data = {head_of_account:'Misc' ,amount:amount, paid_date:date,description:description};
              break;
            case 'TA/DA':
              url = '/user/createMiscellaneousExpense';
              data = {head_of_account:'TA/DA',amount:amount, paid_date:date,description:description};
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
          process.env.REACT_APP_API_URL+url,
          data,
          config
        );
        // console.log(response.data);
        showSuccessToastMessage("Expense Added Succesfully!")
        closeSection();
        fetchBanks()
        setAmount("")
        setDate("")
        setAdvTax("")
        setAuditFeeChange("")
        setAuditYear("")
        setBankAccount("")
        setBankName("")
        setHeadOfAccount("")
        setSubHeadOfAccount("")
        setBillingMonth("")
        setBillReference("")
        setDescription("")
        setEmployeeName("")
        setParticular("")
        setVendor("")
      } catch (error) {
        console.error(error);
        showErrorToastMessage("Error Adding Please Try Again!")
      }
    };
    createExpense();
  };
//Api Integration For Expense Edit Form
const EditOfficeExpense = (e) => {
  e.preventDefault();
  let data = {};
  let url = '';

  switch (headOfAccount) {
    case 'Utility':
      switch (SubHeadOfAccount) {
        case 'Water':
          url = '/user/updateOfficeUtilExpense?id=' + expenseId;
          data = {head_of_account:'Water', bill_reference:billReference, amount:amount, billing_month:billingMonth, paid_date:date };
          break;
        case 'Lesco':
          url = '/user/updateOfficeUtilExpense?id=' + expenseId;
          data = {head_of_account:'Lesco', bill_reference:billReference, amount:amount, billing_month:billingMonth, paid_date:date, adv_tax:advTax };
          break;
        case 'Telephone':
          url = '/user/updateOfficeUtilExpense?id=' + expenseId;
          data = {head_of_account:'Telephone', bill_reference:billReference, amount:amount, billing_month:billingMonth, paid_date:date, adv_tax:advTax };
          break;
        case 'Sui Gas':
          url = '/user/updateOfficeUtilExpense?id=' + expenseId;
          data = {head_of_account:'Gas', bill_reference:billReference, amount:amount, billing_month:billingMonth, paid_date:date };
          break;  
        default:
          return;
      }
      break;

    case 'Bank Charges Expense':
      url = '/user/updateBankExpense?id=' + expenseId;
      data = { amount:amount, bank_account: bankAccount, head_of_account:"Bank Charges", paid_date:date };
      break;

    case 'Legal/Professional':
      switch (SubHeadOfAccount) {
        case 'Legal':
          url = '/user/updateLegalProfessionalExpense?id=' + expenseId;
          data = { head_of_account:"Legal", legal_name: legalName };
          break;
        case 'Accounts Consultant':
          url = '/user/updateLegalProfessionalExpense?id=' + expenseId;
          data = { head_of_account:"Account and Consultant", amount:amount, particulor:particular, paid_date:date, vendor:vendor };
          break;
        case 'Billing Software':
          url = '/user/updateLegalProfessionalExpense?id=' + expenseId;
          data = {head_of_account:"IT Billing", amount:amount, particulor:particular, paid_date:date, vendor:vendor };
          break;
        case 'Tax Consultant':
          url = '/user/updateLegalProfessionalExpense?id=' + expenseId;
          data = { head_of_account:"Tax Consultant", amount:amount, particulor:particular, paid_date:date, vendor:vendor };
          break;
        default:
          return;
      }
      break;

    case 'Salary':
      url = '/user/updateSalary?id=' + expenseId;
      data = { salary_type:"Office", employee_name: employeeName, amount:amount, paid_date:date, head_of_account:"Salaries Office Employees", bank_account:bankAccount };
      break;

    case 'Printing/Stationary':
      url = '/user/updateOfficeExpense?id=' + expenseId;
      data = {head_of_account: "Printing And Stationary", amount:amount, particulor:particular, paid_date:date, vendor:vendor };
      break;

    case 'News Paper/Periodicals':
      url = '/user/updateOfficeExpense?id=' + expenseId;
      data = { head_of_account:"Newspaper", amount:amount, particulor:particular, paid_date:date, vendor:vendor };
      break;

    case 'Rent Rate/Taxes':
      url = '/user/updateOfficeExpense?id=' + expenseId;
      data = { head_of_account:"Rent Rate/Taxes", amount:amount, particulor:particular, paid_date:date, vendor:vendor };
      break;

    case 'Advertisement':
      url = '/user/updateOfficeExpense?id=' + expenseId;
      data = { head_of_account:"Advertisement", amount, particulor: particular, paid_date:date, vendor:vendor };
      break;

    case 'Repair/Maintenance':
      url = '/user/updateLegalProfessionalExpense?id=' + expenseId;
      data = { head_of_account:"Repair/Maintenance",amount:amount, particulor:particular, paid_date:date, vendor:vendor };
      break;

    case 'Audit':
      url = '/user/updateAuditExpense?id=' + expenseId;
      data = { year: auditYear, amount:amount, paid_date:date, head_of_account:"Audit" };
      break;

    case 'Misc':
      switch (SubHeadOfAccount) {
        case 'Misc':
          url = '/user/updateMiscellaneousExpense?id=' + expenseId;
          data = { head_of_account:'Misc', amount:amount, paid_date:date, description:description };
          break;
        case 'TA/DA':
          url = '/user/updateMiscellaneousExpense?id=' + expenseId;
          data = { head_of_account:'TA/DA', amount:amount, paid_date:date, description:description };
          break;
        default:
          return;
      }
      break;

    default:
      return;
  }

  const updateExpense = async () => {
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
      showSuccessToastMessage("Expense Updated Successfully!");
      fetchBanks()
      closeSection();
      setAmount("");
      setDate("");
      setAdvTax("");
      setAuditFeeChange("");
      setAuditYear("");
      setBillReference("")
      setBankAccount("");
      setBankName("");
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


  return (
    <>
      <div className="member-list">
        <div className="title">
          <h2>Office Expense</h2>
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
            <h4>Head Of Account</h4>
            <h4>Paid Date</h4>
            <h4>Amount</h4>
            <h4></h4>
          </div>
        </div>

{/* List Display */}
        <div className={`members ${loading ? 'loading' : ''}`} ref={membersRef}>
          {officeExpensesList.map((member) => (
            <div className="member" key={member._id}>
              <div className="member-details">
              <p>
            {member.mainHeadOfAccount ? member.mainHeadOfAccount.headOfAccount : member.subHeadOfAccount?.headOfAccount}</p>
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
      <h3>Add Office Expense</h3>
      <div className="horizontal-divider"></div>
      <form onSubmit={createNewOfficeExpense}>
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
            <label htmlFor="employeeName">Employee Name: </label>
            <input
              type="text"
              name="employeeName"
              id="employeeName"
              value={employeeName}
              onChange={handleEmployeeNameChange}
              required
            />
            <label htmlFor="amount">Amount: </label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={amount}
                  onChange={handleAmountChange}
                  required
                />
            <label htmlFor="date">Date: </label>
            <input
              type="date"
              name="date"
              id="date"
              value={date}
              onChange={handleDateChange}
              required
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
                <label htmlFor="billingMonth">Billing Month </label>
                <input
                  type="text"
                  name="billingMonth"
                  id="billingMonth"
                  value={billingMonth}
                  onChange={handleBillingMonthChange}
                  required
                />
                <label htmlFor="advTax">Adv Tax </label>
                <input
                  type="text"
                  name="advTax"
                  id="advTax"
                  value={advTax}
                  onChange={handleAdvTaxChange}
                  required
                />
                <label htmlFor="billReference">Bill Reference </label>
                <input
                  type="text"
                  name="billReference"
                  id="billReference"
                  value={billReference}
                  onChange={handleBillReferenceChange}
                  required
                />
                <label htmlFor="paidDate">Paid Date: </label>
                <input
                  type="date"
                  name="paidDate"
                  id="paidDate"
                  value={date}
                  onChange={handleDateChange}
                  required
                />
                <label htmlFor="amount">Amount: </label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={amount}
                  onChange={handleAmountChange}
                  required
                />
              </>
            )}
            {SubHeadOfAccount === "Telephone" && (
              <>
                <label htmlFor="billingMonth">Billing Month: </label>
                <input
                  type="text"
                  name="billingMonth"
                  id="billingMonth"
                  value={billingMonth}
                  onChange={handleBillingMonthChange}
                  required
                />
                <label htmlFor="amount">Amount: </label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={amount}
                  onChange={handleAmountChange}
                  required
                />
                <label htmlFor="advTax">Adv Tax: </label>
                <input
                  type="number"
                  name="advTax"
                  id="advTax"
                  value={advTax}
                  onChange={handleAdvTaxChange}
                  required
                />
                <label htmlFor="billReference">Bill Reference: </label>
                <input
                  type="text"
                  name="billReference"
                  id="billReference"
                  value={billReference}
                  onChange={handleBillReferenceChange}
                  required
                />
                <label htmlFor="paidDate">Paid Date: </label>
                <input
                  type="date"
                  name="paidDate"
                  id="paidDate"
                  value={date}
                  onChange={handleDateChange}
                  required
                />
              </>
            )}
            {SubHeadOfAccount === "Sui Gas" && (
             <>
            <label htmlFor="billingMonth">Billing Month: </label>
            <input
              type="text"
              name="billingMonth"
              id="billingMonth"
              value={billingMonth}
              onChange={handleBillingMonthChange}
              required
            />
            <label htmlFor="amount">Amount: </label>
            <input
              type="number"
              name="amount"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              required
            />
            <label htmlFor="billReference">Bill Reference: </label>
            <input
              type="text"
              name="billReference"
              id="billReference"
              value={billReference}
              onChange={handleBillReferenceChange}
              required
            />
            <label htmlFor="paidDate">Paid Date: </label>
            <input
              type="date"
              name="paidDate"
              id="paidDate"
              value={date}
              onChange={handleDateChange}
              required
            />
          </>
        )}
        {SubHeadOfAccount === "Water" && (
          <>
            <label htmlFor="billingMonth">Billing Month: </label>
            <input
              type="text"
              name="billingMonth"
              id="billingMonth"
              value={billingMonth}
              onChange={handleBillingMonthChange}
              required
            />
            <label htmlFor="amount">Amount: </label>
            <input
              type="number"
              name="amount"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              required
            />
            <label htmlFor="billReference">Bill Reference: </label>
            <input
              type="text"
              name="billReference"
              id="billReference"
              value={billReference}
              onChange={handleBillReferenceChange}
              required
            />
            <label htmlFor="paidDate">Paid Date: </label>
            <input
              type="date"
              name="paidDate"
              id="paidDate"
              value={date}
              onChange={handleDateChange}
              required
            />
          </>
        )}
                
          </>
        )}

        {headOfAccount === "Printing/Stationary (Office)" && (
          <>
            <label htmlFor="amount">Amount: </label>
            <input
              type="number"
              name="amount"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              required
            />
            <label htmlFor="particular">Particular: </label>
            <input
              type="text"
              name="particular"
              id="particular"
              value={particular}
              onChange={handleParticularChange}
              required
            />
            <label htmlFor="date">Date: </label>
            <input
              type="date"
              name="date"
              id="date"
              value={date}
              onChange={handleDateChange}
              required
            />
            <label htmlFor="vendor">Vendor</label>
            <input
              type="text"
              name="vendor"
              id="vendor"
              value={vendor}
              onChange={handleVendorChange}
              required
            />
          </>
        )}

        {headOfAccount === "News Paper/Periodicals" && (
          <>
            <label htmlFor="amount">Amount: </label>
            <input
              type="number"
              name="amount"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              required
            />
            <label htmlFor="particular">Particular: </label>
            <input
              type="text"
              name="particular"
              id="particular"
              value={particular}
              onChange={handleParticularChange}
              required
            />
            <label htmlFor="date">Date: </label>
            <input
              type="date"
              name="date"
              id="date"
              value={date}
              onChange={handleDateChange}
              required
            />
            <label htmlFor="vendor">Vendor</label>
            <input
              type="text"
              name="vendor"
              id="vendor"
              value={vendor}
              onChange={handleVendorChange}
              required
            />
          </>
        )}

        {headOfAccount === "Rent Rate/Taxes" && (
          <>
            <label htmlFor="amount">Amount: </label>
            <input
              type="number"
              name="amount"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              required
            />
            <label htmlFor="particular">Particular: </label>
            <input
              type="text"
              name="particular"
              id="particular"
              value={particular}
              onChange={handleParticularChange}
              required
            />
            <label htmlFor="date">Date: </label>
            <input
              type="date"
              name="date"
              id="date"
              value={date}
              onChange={handleDateChange}
              required
            />
            <label htmlFor="vendor">Vendor</label>
            <input
              type="text"
              name="vendor"
              id="vendor"
              value={vendor}
              onChange={handleVendorChange}
              required
            />
          </>
        )}
        {headOfAccount === "Printing/Stationary" && (
          <>
            <label htmlFor="amount">Amount: </label>
            <input
              type="number"
              name="amount"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              required
            />
            <label htmlFor="particular">Particular: </label>
            <input
              type="text"
              name="particular"
              id="particular"
              value={particular}
              onChange={handleParticularChange}
              required
            />
            <label htmlFor="date">Date: </label>
            <input
              type="date"
              name="date"
              id="date"
              value={date}
              onChange={handleDateChange}
              required
            />
            <label htmlFor="vendor">Vendor</label>
            <input
              type="text"
              name="vendor"
              id="vendor"
              value={vendor}
              onChange={handleVendorChange}
              required
            />
          </>
        )}
        {headOfAccount === "Audit" && (
          <>
            <label htmlFor="amount">Amount: </label>
            <input
              type="number"
              name="amount"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              required
            />
            {/* <label htmlFor="auditFee">Audit Fee: </label>
            <input
              type="number"
              name="auditFee"
              id="auditFee"
              value={auditFee}
              onChange={handleAuditFeeChange}
            /> */}
            <label htmlFor="date">Paid Date: </label>
            <input
              type="date"
              name="date"
              id="date"
              value={date}
              onChange={handleDateChange}
              required
            />
            <label htmlFor="auditYear">Audit Year</label>
            <DatePicker
              selected={auditYear}
              onChange={handleAuditYearChange}
              showYearPicker
              dateFormat="yyyy"
              placeholderText="Select Year"
              value={auditYear}
            />
            
          </>
        )}
        {headOfAccount === "Advertisement" && (
          <>
            <label htmlFor="amount">Amount: </label>
            <input
              type="number"
              name="amount"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
            />
            <label htmlFor="particular">Particular (Paper name): </label>
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
      {headOfAccount === "Legal/Professional" && (
        <>
        <label htmlFor="subHeadOfAccount">Sub Head Of Account: </label>
        <select name="subHeadOfAccount" id="subHeadOfAccount" onChange={handleSubHeadOfAccountChange}>
          <option value="select" hidden>
            Select
          </option>
          {LEGAL_PROFESSIONAL_SUBHEADS.map((subHead, index) => (
            <option key={index} value={subHead}>
              {subHead}
            </option>
          ))}
        </select>
      
        {SubHeadOfAccount === 'Legal' && (
          <>
            <label htmlFor="legalName">Legal Name: </label>
            <input
              type="text"
              name="legalName"
              id="legalName"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
            />
          </>
        )}

      {SubHeadOfAccount === 'Accounts Consultant' && (
        <>
         <label htmlFor="vendor">Vendor</label>
            <input
              type="text"
              name="vendor"
              id="vendor"
              value={vendor}
              onChange={handleVendorChange}
            />
          <label htmlFor="amount">Amount: </label>
          <input
            type="number"
            name="amount"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <label htmlFor="particular">Particular: </label>
          <input
            type="text"
            name="particular"
            id="particular"
            value={particular}
            onChange={(e) => setParticular(e.target.value)}
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

      {SubHeadOfAccount === 'Billing Software' && (
        <>
          <label htmlFor="vendor">Vendor</label>
            <input
              type="text"
              name="vendor"
              id="vendor"
              value={vendor}
              onChange={handleVendorChange}
            />
          <label htmlFor="amount">Amount: </label>
          <input
            type="number"
            name="amount"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <label htmlFor="particular">Particular: </label>
          <input
            type="text"
            name="particular"
            id="particular"
            value={particular}
            onChange={(e) => setParticular(e.target.value)}
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

          {SubHeadOfAccount === 'Tax Consultant' && (
            <>
             <label htmlFor="vendor">Vendor</label>
            <input
              type="text"
              name="vendor"
              id="vendor"
              value={vendor}
              onChange={handleVendorChange}
            />
              <label htmlFor="amount">Amount: </label>
              <input
                type="number"
                name="amount"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <label htmlFor="particular">Particular: </label>
              <input
                type="text"
                name="particular"
                id="particular"
                value={particular}
                onChange={(e) => setParticular(e.target.value)}
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
      {headOfAccount === "Repair/Maintenance" && (
        <>
          <label htmlFor="amount">Amount: </label>
          <input
            type="number"
            name="amount"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <label htmlFor="particular">Particular: </label>
          <input
            type="text"
            name="particular"
            id="particular"
            value={particular}
            onChange={(e) => setParticular(e.target.value)}
          />
          <label htmlFor="paidDate">Paid Date: </label>
          <input
            type="date"
            name="paidDate"
            id="paidDate"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <label htmlFor="vendor">Vendor: </label>
          <input
            type="text"
            name="vendor"
            id="vendor"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
          />
        </>
      )}
      {headOfAccount === "Misc" && (
          <>
              <label htmlFor="subHeadOfAccount">Sub Head Of Account: </label>
              <select name="subHeadOfAccount" id="subHeadOfAccount" onChange={handleSubHeadOfAccountChange}>
                <option value="select" hidden>
                  {SubHeadOfAccount}
                </option>
                {MISC_OFFICE_SUBHEADS.map((subHead, index) => (
                  <option key={index} value={subHead}>
                    {subHead}
                  </option>
                ))}
              </select>
              
              {SubHeadOfAccount === 'Misc' && (
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
                {SubHeadOfAccount === 'TA/DA' && (
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
        {headOfAccount === "Bank Charges Expense" && (
  <>
    <label htmlFor="amount">Amount: </label>
    <input
      type="number"
      name="amount"
      id="amount"
      value={amount}
      onChange={handleAmountChange}
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
    
    <label htmlFor="date">Date: </label>
    <input
      type="date"
      name="date"
      id="date"
      value={date}
      onChange={handleDateChange}
    />
  </>
      )}



        <button type="submit" className="blue-button" onSubmit={createNewOfficeExpense}>
          Save
        </button>
      </form>
    </div>
  </div>
)}

{/* Edit Section */}
{editSection && (
  <div className="left-section">
    <div className="left-section-content">
      <div onClick={closeSection} className="close-button"></div>
      <h3>Edit Office Expense</h3>
      <div className="horizontal-divider"></div>
      <form onSubmit={EditOfficeExpense}>
        <label htmlFor="headOfAccount">Head Of Account: </label>
        <select name="headOfAccount" id="headOfAccount" value={headOfAccount} onChange={(e) => setHeadOfAccount(e.target.value)}>
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
            <label htmlFor="employeeName">Employee Name: </label>
            <input
              type="text"
              name="employeeName"
              id="employeeName"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
            />
            <label htmlFor="amount">Amount: </label>
            <input
              type="number"
              name="amount"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <label htmlFor="date">Date: </label>
            <input
              type="date"
              name="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </>
        )}

        {headOfAccount === "Utility" && (
          <>
            <label htmlFor="subHeadOfAccount">Sub Head Of Account: </label>
            <select name="subHeadOfAccount" id="subHeadOfAccount" value={SubHeadOfAccount} onChange={(e) => setSubHeadOfAccount(e.target.value)}>
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
                <label htmlFor="billingMonth">Billing Month: </label>
                <input
                  type="text"
                  name="billingMonth"
                  id="billingMonth"
                  value={billingMonth}
                  onChange={(e) => setBillingMonth(e.target.value)}
                  required
                />
                <label htmlFor="advTax">Adv Tax: </label>
                <input
                  type="text"
                  name="advTax"
                  id="advTax"
                  value={advTax}
                  onChange={(e) => setAdvTax(e.target.value)}
                  required
                />
                <label htmlFor="billReference">Bill Reference: </label>
                <input
                  type="text"
                  name="billReference"
                  id="billReference"
                  value={billReference}
                  onChange={(e) => setBillReference(e.target.value)}
                  required
                />
                <label htmlFor="date">Paid Date: </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
                <label htmlFor="amount">Amount: </label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </>
            )}
            {SubHeadOfAccount === "Telephone" && (
              <>
                <label htmlFor="billingMonth">Billing Month: </label>
                <input
                  type="text"
                  name="billingMonth"
                  id="billingMonth"
                  value={billingMonth}
                  onChange={(e) => setBillingMonth(e.target.value)}
                  required
                />
                <label htmlFor="amount">Amount: </label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <label htmlFor="advTax">Adv Tax: </label>
                <input
                  type="number"
                  name="advTax"
                  id="advTax"
                  value={advTax}
                  onChange={(e) => setAdvTax(e.target.value)}
                  required
                />
                <label htmlFor="billReference">Bill Reference: </label>
                <input
                  type="text"
                  name="billReference"
                  id="billReference"
                  value={billReference}
                  onChange={(e) => setBillReference(e.target.value)}
                  required
                />
                <label htmlFor="date">Paid Date: </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </>
            )}
            {SubHeadOfAccount === "Sui Gas" && (
              <>
                <label htmlFor="billingMonth">Billing Month: </label>
                <input
                  type="text"
                  name="billingMonth"
                  id="billingMonth"
                  value={billingMonth}
                  onChange={(e) => setBillingMonth(e.target.value)}
                  required
                />
                <label htmlFor="amount">Amount: </label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <label htmlFor="billReference">Bill Reference: </label>
                <input
                  type="text"
                  name="billReference"
                  id="billReference"
                  value={billReference}
                  onChange={(e) => setBillReference(e.target.value)}
                  required
                />
                <label htmlFor="date">Paid Date: </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </>
            )}
            {SubHeadOfAccount === "Water" && (
              <>
                <label htmlFor="billingMonth">Billing Month: </label>
                <input
                  type="text"
                  name="billingMonth"
                  id="billingMonth"
                  value={billingMonth}
                  onChange={(e) => setBillingMonth(e.target.value)}
                  required
                />
                <label htmlFor="amount">Amount: </label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <label htmlFor="billReference">Bill Reference: </label>
                <input
                  type="text"
                  name="billReference"
                  id="billReference"
                  value={billReference}
                  onChange={(e) => setBillReference(e.target.value)}
                  required
                />
                <label htmlFor="date">Paid Date: </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </>
            )}
          </>
        )}

        {headOfAccount === "Legal/Professional" && (
          <>
            <label htmlFor="subHeadOfAccount">Sub Head Of Account: </label>
            <select
              name="subHeadOfAccount"
              id="subHeadOfAccount"
              onChange={handleSubHeadOfAccountChange}
            >
              <option value="select" hidden>
                {SubHeadOfAccount}
              </option>
              {LEGAL_PROFESSIONAL_SUBHEADS.map((subHead, index) => (
                <option key={index} value={subHead}>
                  {subHead}
                </option>
              ))}
            </select>

            {SubHeadOfAccount === 'Legal' && (
              <>
                <label htmlFor="legalName">Legal Name: </label>
                <input
                  type="text"
                  name="legalName"
                  id="legalName"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                />
              </>
            )}

            {SubHeadOfAccount === 'Accounts Consultant' && (
              <>
                <label htmlFor="vendor">Vendor</label>
                <input
                  type="text"
                  name="vendor"
                  id="vendor"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                />
                <label htmlFor="amount">Amount: </label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <label htmlFor="particular">Particular: </label>
                <input
                  type="text"
                  name="particular"
                  id="particular"
                  value={particular}
                  onChange={(e) => setParticular(e.target.value)}
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

            {SubHeadOfAccount === 'Billing Software' && (
              <>
                <label htmlFor="vendor">Vendor</label>
                <input
                  type="text"
                  name="vendor"
                  id="vendor"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                />
                <label htmlFor="amount">Amount: </label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <label htmlFor="particular">Particular: </label>
                <input
                  type="text"
                  name="particular"
                  id="particular"
                  value={particular}
                  onChange={(e) => setParticular(e.target.value)}
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

            {SubHeadOfAccount === 'Tax Consultant' && (
              <>
                <label htmlFor="vendor">Vendor</label>
                <input
                  type="text"
                  name="vendor"
                  id="vendor"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                />
                <label htmlFor="amount">Amount: </label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <label htmlFor="particular">Particular: </label>
                <input
                  type="text"
                  name="particular"
                  id="particular"
                  value={particular}
                  onChange={(e) => setParticular(e.target.value)}
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

        {headOfAccount === "Bank Charges" || headOfAccount === "Bank Charges Expense" && (
          <>

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
    
              <label htmlFor="date">Date: </label>
              <input
                type="date"
                name="date"
                readOnly
                id="date"
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
        {headOfAccount === "Printing And Stationary" || headOfAccount==="Printing/Stationary" && (
          <>
            <label htmlFor="amount">Amount: </label>
            <input
              type="number"
              name="amount"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <label htmlFor="particular">Particular: </label>
            <input
              type="text"
              name="particular"
              id="particular"
              value={particular}
              onChange={(e) => setParticular(e.target.value)}
              required
            />
            <label htmlFor="date">Date: </label>
            <input
              type="date"
              name="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <label htmlFor="vendor">Vendor</label>
            <input
              type="text"
              name="vendor"
              id="vendor"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              required
            />
          </>
        )}
        {headOfAccount === "Audit" && (
        <>
          <label htmlFor="auditYear">Audit Year</label>
            <DatePicker
              selected={auditYear}
              onChange={handleAuditYearChange}
              showYearPicker
              dateFormat="yyyy"
              placeholderText="Select Year"
              value={auditYear}
            />
          <label htmlFor="amount">Amount: </label>
          <input
            type="number"
            name="amount"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <label htmlFor="date">Date: </label>
          <input
            type="date"
            name="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </>
      )}
        {headOfAccount === "Repair/Maintenance" && (
          <>
            <label htmlFor="particular">Particular: </label>
            <input
              type="text"
              name="particular"
              id="particular"
              value={particular}
              onChange={(e) => setParticular(e.target.value)}
              required
            />
            <label htmlFor="amount">Amount: </label>
            <input
              type="number"
              name="amount"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <label htmlFor="date">Date: </label>
            <input
              type="date"
              name="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </>
        )}
      
        {headOfAccount === "Advertisement" && (
          <>
            
            <label htmlFor="amount">Amount: </label>
            <input
              type="number"
              name="amount"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
             <label htmlFor="particular">Particular: </label>
            <input
              type="text"
              name="particular"
              id="particular"
              value={particular}
              onChange={(e) => setParticular(e.target.value)}
              required
            />
            <label htmlFor="vendor">Vendor: </label>
    <input
      type="text"
      name="vendor"
      id="vendor"
      value={vendor}
      onChange={(e) => setVendor(e.target.value)}
      required
    />
            <label htmlFor="date">Date: </label>
            <input
              type="date"
              name="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </>
        )}

        {headOfAccount === "Rent Rate/Taxes" && (
          <>
            <label htmlFor="particular">Particular: </label>
            <input
              type="text"
              name="particular"
              id="particular"
              value={particular}
              onChange={(e) => setParticular(e.target.value)}
              required
            />
            <label htmlFor="amount">Amount: </label>
            <input
              type="number"
              name="amount"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <label htmlFor="date">Date: </label>
            <input
              type="date"
              name="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </>
        )}
        {headOfAccount === "News Paper/Periodicals" && (
  <>
    <label htmlFor="amount">Amount: </label>
    <input
      type="number"
      name="amount"
      id="amount"
      value={amount}
      onChange={(e) => setAmount(e.target.value)}
      required
    />
    <label htmlFor="particular">Particular: </label>
    <input
      type="text"
      name="particular"
      id="particular"
      value={particular}
      onChange={(e) => setParticular(e.target.value)}
      required
    />
    <label htmlFor="date">Date: </label>
    <input
      type="date"
      name="date"
      id="date"
      value={date}
      onChange={(e) => setDate(e.target.value)}
      required
    />
    <label htmlFor="vendor">Vendor: </label>
    <input
      type="text"
      name="vendor"
      id="vendor"
      value={vendor}
      onChange={(e) => setVendor(e.target.value)}
      required
    />
  </>
        )}


        {headOfAccount === "Misc" && (
                  <>
                      <label htmlFor="subHeadOfAccount">Sub Head Of Account: </label>
                      <select name="subHeadOfAccount" id="subHeadOfAccount" onChange={handleSubHeadOfAccountChange}>
                        <option value="select" hidden>
                          Select
                        </option>
                        {MISC_OFFICE_SUBHEADS.map((subHead, index) => (
                          <option key={index} value={subHead}>
                            {subHead}
                          </option>
                        ))}
                      </select>
                      
                      {SubHeadOfAccount === 'Misc' && (
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
                        {SubHeadOfAccount === 'TA/DA' && (
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

        <br></br>
        <button type="submit" className="submit-button">
          Update
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

export default OfficeExpenseComponent;
