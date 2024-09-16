import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./style/memberListStyle.css";
import "./style/reports.css";
import useFetchBanks from './fetch_banks';
import { ToastContainer } from 'react-toastify';
import { showErrorToastMessage, showSuccessToastMessage } from './toastUtils'; // Import both error and success toast

const ReportsComponent = () => {
  const [selectedReport, setSelectedReport] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [taxation, setTaxation] = useState('');
  const [accumulatedSurplus, setAccumulatedSurplus] = useState('');
  const [loading, setLoading] = useState(false);
  const [incomeStatementGenerated, setIncomeStatementGenerated] = useState(false);
  const { bankList } = useFetchBanks();
  const [selectedBank, setSelectedBank] = useState("");
  const [balanceSheetState, setBalanceSheetState] = useState({
    reserve_fund: '',
    accumulated_surplus: '',
    share_deposit_money: '',
    trade_and_other_payable: '',
    provision_for_taxation: '',
    intangible_assets: '',
    purchase_of_land: '',
    cost_of_land_development: '',
    long_term_security_deposit: ''
  });
  const reports = [
    { value: 'bankLedger', label: 'Bank Ledger' },
    { value: 'cashBook', label: 'Cash Book' },
    { value: 'generalLedger', label: 'General Ledger' },
    { value: 'balanceSheet', label: 'Balance Sheet', disabled: !incomeStatementGenerated },
    { value: 'incomeStatement', label: 'Income Statement' }
  ];

  const reportUrls = {
    bankLedger: '/user/bankLedgerPdf',
    cashBook: '/user/cashLedgerPdf',
    generalLedger: '/user/generalLedgerPdf',
    balanceSheet: '/user/balanceSheetPdf',
    incomeStatement: '/user/incomeRecordPdf'
  };
  const clearData = () => {
    setSelectedReport('');
    setStartDate('');
    setEndDate('');
    setTaxation('');
    setAccumulatedSurplus('');
    setSelectedBank('');
    setBalanceSheetState({
      reserve_fund: '',
      accumulated_surplus: '',
      share_deposit_money: '',
      trade_and_other_payable: '',
      provision_for_taxation: '',
      intangible_assets: '',
      purchase_of_land: '',
      cost_of_land_development: '',
      long_term_security_deposit: ''
    });
  };

  const getFixedStartDate = () => {
    const now = new Date();
    const year = now.getMonth() >= 6 ? now.getFullYear()-1 : now.getFullYear() - 1;
    return new Date(`${year}-07-01`);
  };

  const getFixedEndDate = () => {
    const now = new Date();
    const year = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear();
    return new Date(`${year}-06-30`);
  };

  useEffect(() => {
    if (selectedReport === 'balanceSheet' || selectedReport === 'incomeStatement') {
      setStartDate(getFixedStartDate().toISOString().split('T')[0]);
      setEndDate(getFixedEndDate().toISOString().split('T')[0]);
    } else {
      setStartDate('');
      setEndDate('');
    }
  }, [selectedReport]);

  const formatAndEncodeDate = (date) => {
    return encodeURIComponent(new Date(date).toISOString());
  };

  const handleDownload = async () => {
    if (!selectedReport) {
      showErrorToastMessage('Please select a report.');
      return;
    }

    if (!startDate || !endDate) {
      showErrorToastMessage('Please fill in both start date and end date.');
      return;
    }

    if (selectedReport === 'incomeStatement' && (!taxation || !accumulatedSurplus)) {
      showErrorToastMessage('Please fill in both taxation and accumulated surplus fields.');
      return;
    }

    setLoading(true);

    try {
      const config = {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          Accept: 'application/pdf',
        },
        responseType: 'blob',
      };

      const apiUrl = reportUrls[selectedReport];
      const url = `${process.env.REACT_APP_API_URL}${apiUrl}?startDate=${formatAndEncodeDate(startDate)}&endDate=${formatAndEncodeDate(endDate)}`;

      const data = {};
      
      if (selectedReport === 'incomeStatement') {
        data.taxation = taxation;
        data.accumulated_surplus_brought_forward = accumulatedSurplus;
        setIncomeStatementGenerated(true); 
      }

      if (selectedReport === 'bankLedger') {
        const selectedBankDetails = bankList.find(bank => bank.accountNo === selectedBank);
        if (selectedBankDetails) {
          data.bank_account = selectedBankDetails.accountNo; 
        } else {
          showErrorToastMessage('Selected bank not found.');
          setLoading(false);
          return;
        }
      }

      if (selectedReport === 'balanceSheet') {
        if (!incomeStatementGenerated) {
          showErrorToastMessage('Please generate the Income Statement first.');
          return;
        }
        Object.assign(data, balanceSheetState);
      }
      
      const response = await axios.post(url, data, config);
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(pdfBlob);
      link.setAttribute('download', `${selectedReport}_report.pdf`);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSuccessToastMessage('Report downloaded successfully!');
      clearData();
    } catch (error) {
      showErrorToastMessage('Failed to download report. Please try again.');
      console.error('Error downloading report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="top-bar">
        <div className="top-bar-item">
          <h4>Generate Report</h4>
        </div>
      </div>

      <div className="left-section-content">
        <form className='reportForm'>
          <label>Select Report:</label>
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
          >
            <option value="">Select a Report</option>
            {reports.map((report) => (
              <option key={report.value} value={report.value} disabled={report.disabled}>
                {report.label}
              </option>
            ))}
          </select>

          <div className="details">
            <div className="details-item">
              <label>Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <label>End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {selectedReport === 'bankLedger' && (
            <div className="details-item">
              <label htmlFor="bank-name">Bank Name: </label>
              <select
                name="bank-name"
                className='bank-name'
                id="bank-name"
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
              >
                <option value="select" hidden>
                  {selectedBank}
                </option>
                {bankList.map((bank) => (
                  <option value={bank.accountNo} key={bank.accountNo}>
                    {bank.bankName} - {bank.branchCode}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedReport === 'incomeStatement' && (
            <div className="income-statement-fields">
              <div className="details-item">
                <label>Taxation:</label>
                <input
                  type="number"
                  placeholder="Enter Taxation Amount"
                  value={taxation}
                  onChange={(e) => setTaxation(e.target.value)}
                />
              </div>
              <div className="details-item">
                <label>Accumulated Surplus Brought Forward:</label>
                <input
                  type="number"
                  placeholder="Enter Accumulated Surplus"
                  value={accumulatedSurplus}
                  onChange={(e) => setAccumulatedSurplus(e.target.value)}
                />
              </div>
            </div>
          )}

           {selectedReport === 'balanceSheet' && (
            <div className="balance-sheet-fields">
              <div className="details-item">
                <label>Reserve Fund:</label>
                <input
                  type="number"
                  placeholder="Enter Reserve Fund"
                  value={balanceSheetState.reserve_fund}
                  onChange={(e) => setBalanceSheetState({
                    ...balanceSheetState,
                    reserve_fund: e.target.value
                  })}
                />
                <label>Accumulated Surplus:</label>
                <input
                  type="number"
                  placeholder="Enter Accumulated Surplus"
                  value={balanceSheetState.accumulated_surplus}
                  onChange={(e) => setBalanceSheetState({
                    ...balanceSheetState,
                    accumulated_surplus: e.target.value
                  })}
                />
              </div>
              <div className="details-item">
                <label>Share Deposit Money:</label>
                <input
                  type="number"
                  placeholder="Enter Share Deposit Money"
                  value={balanceSheetState.share_deposit_money}
                  onChange={(e) => setBalanceSheetState({
                    ...balanceSheetState,
                    share_deposit_money: e.target.value
                  })}
                />
                <label>Trade and Other Payables:</label>
                <input
                  type="number"
                  placeholder="Enter Trade and Other Payables"
                  value={balanceSheetState.trade_and_other_payable}
                  onChange={(e) => setBalanceSheetState({
                    ...balanceSheetState,
                    trade_and_other_payable: e.target.value
                  })}
                />
              </div>
              <div className="details-item">
                <label>Provision for Taxation:</label>
                <input
                  type="number"
                  placeholder="Enter Provision for Taxation"
                  value={balanceSheetState.provision_for_taxation}
                  onChange={(e) => setBalanceSheetState({
                    ...balanceSheetState,
                    provision_for_taxation: e.target.value
                  })}
                />
                <label>Intangible Assets:</label>
                <input
                  type="number"
                  placeholder="Enter Intangible Assets"
                  value={balanceSheetState.intangible_assets}
                  onChange={(e) => setBalanceSheetState({
                    ...balanceSheetState,
                    intangible_assets: e.target.value
                  })}
                />
              </div>
              <div className="details-item">
                <label>Purchase of Land:</label>
                <input
                  type="number"
                  placeholder="Enter Purchase of Land"
                  value={balanceSheetState.purchase_of_land}
                  onChange={(e) => setBalanceSheetState({
                    ...balanceSheetState,
                    purchase_of_land: e.target.value
                  })}
                />
                <label>Cost of Land Development:</label>
                <input
                  type="number"
                  placeholder="Enter Cost of Land Development"
                  value={balanceSheetState.cost_of_land_development}
                  onChange={(e) => setBalanceSheetState({
                    ...balanceSheetState,
                    cost_of_land_development: e.target.value
                  })}
                  />
              </div>
              <div className="details-item">
                <label>Long Term Security Deposit:</label>
                <input
                  type="number"
                  placeholder="Enter Long Term Security Deposit"
                  value={balanceSheetState.long_term_security_deposit}
                  onChange={(e) => setBalanceSheetState({
                    ...balanceSheetState,
                    long_term_security_deposit: e.target.value
                  })}
                />
              </div>
            </div>
          )}

          <button className="blue-button" type="button" onClick={handleDownload}>
            {loading ? 'Downloading...' : 'Download Report'}
          </button>
        </form>
      </div>
      <ToastContainer />
    </>
  );
};

export default ReportsComponent;
