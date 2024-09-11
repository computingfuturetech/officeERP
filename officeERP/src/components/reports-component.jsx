import React, { useState } from 'react';
import axios from 'axios';
import "./style/memberListStyle.css";
import "./style/reports.css"

const ReportsComponent = () => {
  const [selectedReport, setSelectedReport] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [taxation, setTaxation] = useState('');
  const [accumulatedSurplus, setAccumulatedSurplus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  

  const [balanceSheetState, setBalanceSheetState] = useState({
    reserve_fund: '',
    accumulated_surplus: '',
    share_deposit_money: '',
    trade_and_other_payable: '',
    provision_for_taxation: '',
    intangible_assets: '',
    purchase_of_land: '',
    cost_of_land_developement: '',
    long_term_security_deposit: ''
  });

  const reports = [
    { value: 'bankLedger', label: 'Bank Ledger' },
    { value: 'cashBook', label: 'Cash Book' },
    { value: 'generalLedger', label: 'General Ledger' },
    { value: 'balanceSheet', label: 'Balance Sheet' },
    { value: 'incomeStatement', label: 'Income Statement' },
  ];

  const reportUrls = {
    bankLedger: '/user/bankLedgerPdf',
    cashBook: '/user/cashBookPdf',
    generalLedger: '/user/generalLedgerPdf',
    balanceSheet: '/user/balanceSheetPdf',
    incomeStatement: '/user/incomeRecordPdf'
  };

  const formatAndEncodeDate = (date) => {
    return encodeURIComponent(new Date(date).toISOString());
  };

  const handleDownload = async () => {
    if (!selectedReport) {
      setError('Please select a report.');
      return;
    }

    if (!startDate || !endDate) {
      setError('Please fill in both start date and end date.');
      return;
    }
    
    if (selectedReport === 'incomeStatement' && (!taxation || !accumulatedSurplus)) {
      setError('Please fill in both taxation and accumulated surplus fields.');
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
      }

      if (selectedReport === 'balanceSheet') {
        Object.assign(data, balanceSheetState); 
      }
      console.log(data)

      const response = await axios.post(url, data, config);
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(pdfBlob);
      link.setAttribute('download', `${selectedReport}_report.pdf`);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setError('');
    } catch (error) {
      console.error('Error downloading report:', error);
      setError('Failed to download report. Please try again.');
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

      {error && <p>{error}</p>}

      <div className="left-section-content">
        <form className='reportForm'>
          <label>Select Report:</label>
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
          >
            <option value="">Select a Report</option>
            {reports.map((report) => (
              <option key={report.value} value={report.value}>
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
                  value={balanceSheetState.cost_of_land_developement}
                  onChange={(e) => setBalanceSheetState({
                    ...balanceSheetState,
                    cost_of_land_developement: e.target.value
                  })}
                />
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
    </>
  );
};

export default ReportsComponent;
