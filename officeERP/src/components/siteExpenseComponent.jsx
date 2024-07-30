import React from 'react'
import { useEffect, useState, useRef } from "react";
import "./style/memberListStyle.css";
import { Link } from "react-router-dom";


function SiteExpenseComponent() {
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [siteExpenseList, setsiteExpenseList] = useState([]);
  const membersRef = useRef(null);
  const [showOptions, setShowOptions] = useState(false);
  const [page, setPage] = useState(1);
  const [editSection, setEditSection] = useState(false);
  const [addNew, setAddNew] = useState(false);
  const [amount, setAmount] = useState('');
  const [headOfAccount,setHeadOfAccount]=useState("")
  const Expenses = ['Salaries', 'Lesco', 'Repair/Maintainance', 'Electricity', 'Vehicle'];

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const config = {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token'),
          },
        };
        const response = await axios.get(process.env.REACT_APP_API_URL + '/user/getOfficeExpense', config);
        setsiteExpenseList(response.data);
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBanks();
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  
  };
  
  const handleEditSection = (member) => {
    setSelectedMember(member);
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

  const createNewSiteExpense=(e)=>{
    e.preventDefault();
    console.log("snew created")
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
            <h4>Particular</h4>
            <h4>Vendor</h4>
            <h4>Paid Date</h4>
            <h4>Amount</h4>
            <h4></h4>
          </div>
        </div>

        <div className={`members ${loading ? 'loading' : ''}`} ref={membersRef}>
          {siteExpenseList.map((member) => (
            <div className="member" key={member._id}>
              <div className="member-details">
                <p>{member.particulor}</p>
                <p>{member.vendor}</p>
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

        {addNew && (
          <div className="left-section">
            <div className="left-section-content">
              <div onClick={closeSection} className="close-button"></div>
              <h3>Add Site Expense</h3>
              <div className="horizontal-divider"></div>
              <form onSubmit={createNewSiteExpense}>
              <label htmlFor="amount">Head Of Account: </label>
                <input
                  type="text"
                  name="amount"
                  id="amount"
                  value={amount}
                  onChange={(e) => setHeadOfAccount(e.target.value)}
                />
                <label htmlFor="msNo">Particular: </label>
                <select name="bank-name" id="bank-name" onChange={handleExpenseChange}>
                  <option value="select" hidden>
                    Select
                  </option>
                  {Expenses.map((expense, index) => (
                    <option key={index} value={expense}>
                      {expense}
                    </option>
                  ))}
                </select>

                <label htmlFor="purchaseName">Vendor</label>
                <select name="account-number" id="account-number" onChange={handleExpenseChange}>
                  <option value="select" hidden>
                    Select
                  </option>
                  {Expenses.map((expense, index) => (
                    <option key={index} value={expense}>
                      {expense}
                    </option>
                  ))}
                </select>
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
                  name="amount"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <button type="submit" className="blue-button" onSubmit={createNewSiteExpense}>
                  Save
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default SiteExpenseComponent
