import React, { useEffect, useState, useRef } from "react";
import "./style/memberListStyle.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./style/bankprofit.css"
import Multiselect from 'multiselect-react-dropdown';

export default function BankProfitComponent() {
  const history = useNavigate();
//   const [showSection, setShowSection] = useState(false);
  const [BankProfitList, setBankProfitList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [page, setPage] = useState(1);
  const [editSection, setEditSection] = useState(false);
  const membersRef = useRef(null);
  const [profitBank, setProfitBank] = useState("");
  const [monthName, setMonthName] = useState("");
  const [amount, setAmount] = useState("");
  const [addNew, setAddNew] = useState(false);
  const [bankList,setBankList]=useState([])
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [bankName, setBankName]=useState("")
  const [profit_id,setProfitId]=useState("")
  const [hasMorePages,setHasMorePages]=useState(true)
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const [selectedList,setSelectedList]=useState([])
  const [filteredData,setFilteredData]=useState([])
  const [filtersSelected,setfiltersSelected]=useState(0)
  const timeoutRef = useRef(null); // Ref to keep track of the timeout
  const allBanks=[
    "Allied Bank(ABL)","Punjab Provincial Cooperative Bank (PPCB)","Muslim Commercial Bank (MCB)","Bank of Punjab (BOP)"
  ]



//   useEffect(() => {
//     const fetchProfitBanks= async() =>{
//       try {
//         const config = {
//           headers: {
//             Authorization: "Bearer " + localStorage.getItem("token"),
//           },
//       }
//       const response=await axios.get(
//         `http://192.168.0.189:3001/user/getBankProfit`,
//         config
//       )
//       setBankProfitList(response.data)
//       console.log(BankProfitList)
//     }
//     catch(error){
//       console.error(error);
//     }
//   }
//   fetchProfitBanks()
// }, []);

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


const [isFetching, setIsFetching] = useState(false);

useEffect(() => {
  
  const fetchData = async () => {
    if (isFetching || !hasMorePages) return; // Prevent duplicate calls
    setIsFetching(true);
    try {
      const config = {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      };

      const response = await axios.get(
        `http://192.168.0.189:3001/user/getBankProfit/?page_no=${page}`,
        config
      );
      console.log(response.data);
      if (response.data.bankProfits.length > 0) {
        setBankProfitList((prevList) => [...prevList, ...response.data.bankProfits]);
        setHasMorePages(response.data.hasMore);

      } else {
        setHasMorePages(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false)
      setIsFetching(false); // Ensure this is called regardless of success or failure
    }
  };
 // Clean up function to clear the timeout if the effect runs again
 if (timeoutRef.current) {
  clearTimeout(timeoutRef.current);
}

// Set a new timeout for debouncing
timeoutRef.current = setTimeout(() => {
  fetchData();
}, 500); // 500ms debounce delay

// Cleanup timeout on component unmount
return () => {
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
  }
};
}, [page, hasMorePages]);

// Optional: If you need to handle `hasMorePages` changes separately, you can add another useEffect
useEffect(() => {
  if (!hasMorePages) return;
  // Add any logic that needs to run when hasMorePages changes
}, [hasMorePages]);

  const handleScroll = () => {
    console.log("scrolling");
    if (membersRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = membersRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 50 && !loading) {
        setPage((prevPage) => prevPage + 1);
      }
    }
  };

  function dummy(){
    console.log('sdaf');
  }

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



  const handleBankChange = (e) => {
    const selectedBankId = e.target.value
    setSelectedBank(selectedBankId);
    const account = bankList.find((item) => item.bankId === selectedBankId);
    const profitid=BankProfitList.find((item) => item._id === selectedBankId)
    if (profitid) {
      setProfitId(profitid)
    }
  };
  const handleAccountChange = (e) => {
    setSelectedAccount(e.target.value);
  };
  useEffect(() => {
    if (selectedBank) {
      const firstAccount = bankList.find((bank) => bank._id === selectedBank)?.accountNo || '';
      setSelectedAccount(firstAccount);
    }
  }, [selectedBank, bankList]);
  const handleAddNew = (member) => {
    console.log('bankList'+bankList)
    scrollToTop();
    setSelectedMember(member);
    setAddNew(true);
    setShowOptions(false);
  };
  const handleEditSection = (member) => {
    setSelectedMember(member);
    setMonthName(member.profitMonth);
    setAmount(member.amount);
    setBankName(member.bankName)
    setProfitId(member._id)
    setSelectedAccount(member.bankAccount)

    setEditSection(true);
    setShowOptions(false);
  };

  const handleShowOptions = (member) => {
    setSelectedMember(member);
    setShowOptions(!showOptions);
  };

  const closeSection = () => {
    setAddNew(false);
    setMonthName("");
    setAmount("");
    setBankName("");
    setSelectedAccount("");
    setEditSection(false);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const createNewBankProfit = (e) => {
    e.preventDefault();
    const data = {
      bank_account: selectedAccount,
      profit_month: monthName,
      bank_name:bankName,
      amount: amount
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
          `http://192.168.0.189:3001/user/createBankProfit`,
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
  };

  const updateBankProfit = (e) => {
    e.preventDefault();
    const account = bankList.find((item) => item._id === selectedBank);

    const data = {
      bank_account: selectedAccount,
      profit_month: monthName,
      bank_name:bankName,
      amount: amount,
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
          process.env.REACT_APP_API_URL + `/user/updateBankProfit?id=${profit_id}`,
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
  };

  const handleSearch = (e) => {
    e.preventDefault();
    try {
      const searchValue = e.target[0].value;
      console.log(searchValue);
      const search = async () => {
        setLoading(true);
        console.log(searchValue);
        try {
          const config = {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          };
          const response = await axios.get(
            process.env.REACT_APP_API_URL + `/user/getBankProfit/?bankname=${searchValue.trim()}`,
            config
          );
          console.log(response.data);
          if (response.data.length > 0) {
            setBankProfitList(response.data);

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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  
  };
  const handleSelect = (selectedList) => {
    setfiltersSelected((filtersSelected) => filtersSelected + 1);
    setSelectedList(selectedList);
    filterBanks(selectedList);
    console.log(filteredData)
    
  };
  const filterBanks = async (selectedBanks) => {
    setLoading(true);
    if(selectedBanks===""){
      setLoading(false)
      return
    }
    try {
      // Construct the bank names query parameter as a comma-separated string
      const bankNames = selectedBanks.map(bank => bank.bankName).join(',');
      const config = {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      };
      // Make the API call with bank names as a query parameter
      const response = await axios.get(
        process.env.REACT_APP_API_URL+`/user/getBankProfit/?bankname=${bankNames}`,
        config
      );
  
      // Assuming the response data contains the filtered list
      if (response.data.length > 0) {
        console.log('hi')
        setFilteredData(response.data.bankProfits);
        setBankProfitList([])
      } else {
        setFilteredData([]); // Clear the filtered data if no results
      }
      console.log('Filtered Data:', response.data.bankProfits, selectedBanks);
      setFilteredData(response.data.bankProfits)
    } catch (error) {
      console.error('Error fetching filtered data:', error);
    } finally {
      setLoading(false); // Ensure loading state is updated
    }
  };
  
  const handleRemove = (selectedList) => {
    setfiltersSelected((filtersSelected) => filtersSelected - 1);
    setSelectedList(selectedList);
    filterBanks(selectedList);
    
  };


  return (
    <div className="member-list">
      <div className="title">
        <h2>BankProfit</h2>
        <div className="title-buttons">
        <Multiselect
            options={bankList}
            displayValue="bankName"
            onSelect={handleSelect}
            onRemove={handleRemove}
            showCheckbox
            style={{
              chips: { background: "#1640d6" },
              searchBox: { border: "1px solid #ccc", borderRadius: "4px"},
            }}
            placeholder="Filter by Bank"
            avoidHighlightFirstOption
            disablePreSelectedValues
            showArrow
            hidePlaceholder
          />
          <Link className="blue-button" onClick={handleAddNew}> Add New</Link> 
          <Link className="simple-button" onClick={handleRefresh}>
            Refresh
          </Link>
        </div>
      </div>
      <div className="top-bar">
        <div className="top-bar-item">
          <h4>Bank Name</h4>
          <h4>Account Number</h4>
          <h4>Month</h4>
          <h4>Amount</h4>
          <h4></h4>
        </div>
      </div>

      <div className={`members  ${loading ? "loading" : ""}`} ref={membersRef}>
      {(filtersSelected > 0 ? filteredData : BankProfitList).map((member) => (
          <div className="member bankprofit" key={member._id}>
            <div className="member-details">
              <p>{member.bankName}</p>
              <p>{member.bankAccount}</p>
              <p>{member.profitMonth}</p>
              <p>{member.amount === "" ? "-" : member.amount}</p>
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





      {editSection && (
        <div className="left-section">
        <div className="left-section-content">
          <div onClick={closeSection} className="close-button"></div>
          <h3>Add Bank Profit</h3>
          <div className="horizontal-divider"></div>
          <form onSubmit={updateBankProfit}>
            <label htmlFor="msNo">Bank Name: </label>
            {/* <input
              type="text"
              // readOnly
              className="read-only"
              name="msNo"
              id="msNo"
              value={msNo}
              onChange={(e) => setMsNo(e.target.value)}
            /> */}
            <select name="bank-name" id="bank-name" onChange={handleBankChange}>
              <option value="select" hidden>{bankName}</option>
              {bankList.map((bank) => (
                  <option value={bank._id} key={bank._id}>{bank.bankName} - {bank.branchCode}</option>
                ))}
            </select>
            <label htmlFor="purchaseName">Account Number: </label>
            <select name="account-number" id="account-number" onChange={handleAccountChange} value={selectedAccount}>
            <option value={selectedAccount} hidden>{selectedAccount}</option>
            {/* {bankList
                .filter((bank) => bank._id === selectedBank)
                .map((bank) => (
                  <option value={bank.accountNo} key={bank.accountNo}>{bank.accountNo}</option>
                ))} */}
            </select>
            <label htmlFor="monthName">Month: </label>
            <select
              name="monthName"
              id="monthName"
              value={monthName}
              onChange={(e) => setMonthName(e.target.value)}
            >
              {months.map((month, index) => (
                <option key={index} value={month}>{month}</option>
              ))}
            </select>
            <label htmlFor="amount">Amount: </label> 
            <input
              type="text"
              name="amount"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button
              type="submit"
              className="blue-button"
              onClick={updateBankProfit}
            >
              Save
            </button>
          </form>
        </div>
      </div>
      )}




      {addNew && (
        <div className="left-section">
          <div className="left-section-content">
            <div onClick={closeSection} className="close-button"></div>
            <h3>Add Bank Profit</h3>
            <div className="horizontal-divider"></div>
            <form onSubmit={createNewBankProfit}>
              <label htmlFor="msNo">Bank Name: </label>
              {/* <input
                type="text"
                // readOnly
                className="read-only"
                name="msNo"
                id="msNo"
                value={msNo}
                onChange={(e) => setMsNo(e.target.value)}
              /> */}
              <select name="bank-name" id="bank-name" onChange={handleBankChange}>
                <option value="select" hidden>Select</option>
                {bankList.map((bank) => (
                  <option value={bank._id} key={bank._id}>{bank.bankName} - {bank.branchCode}</option>
                ))}
              </select>
              <label htmlFor="purchaseName">Account Number: </label>
              <select name="account-number" id="account-number" onChange={handleAccountChange}>
              <option value="select" hidden>Select</option>
              {bankList
                .filter((bank) => bank._id === selectedBank)
                .map((bank) => (
                  <option value={bank.accountNo} key={bank.accountNo}>{bank.accountNo}</option>
                ))}
            </select>

            <label htmlFor="monthName">Month: </label>
            <select
              name="monthName"
              id="monthName"
              value={monthName}
              onChange={(e) => setMonthName(e.target.value)}
            >
              <option value="" hidden>Select a month</option>
              {months.map((month, index) => (
                <option key={index} value={month}>{month}</option>
              ))}
            </select>

            <label htmlFor="amount">Amount: </label>
            <input
              type="number"
              name="amount"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

              <button
                type="submit"
                className="blue-button"
                onClick={createNewBankProfit}
              >
                Save
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
