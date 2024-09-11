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

  const reports = [
    { value: 'bankLedger', label: 'Bank Ledger' },
    { value: 'cashBook', label: 'Cash Book' },
    { value: 'generalLedger', label: 'General Ledger' },
    { value: 'balanceSheet', label: 'Balance Sheet' },
    { value: 'incomeStatement', label: 'Income Statement' },
  ];

  // Function to format date to ISO and URL encode it
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
        },
      };


      const url = `${process.env.REACT_APP_API_URL}/user/incomeRecordPdf?startDate=${formatAndEncodeDate(startDate)}&endDate=${formatAndEncodeDate(endDate)}`;
      const data = {};
      if (selectedReport === 'incomeStatement') {
        data.taxation = taxation;
        data.accumulated_surplus_brought_forward = accumulatedSurplus;
      }
      console.log(data)
      const response = await axios.post(url, data, config);
      const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = urlBlob;
      link.setAttribute('download', `${selectedReport}_report.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setError('');
      setLoading(false);
    } catch (error) {
      console.error('Error downloading report:', error);
      setError('Failed to download report. Please try again.');
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

      {error && <p style={{ color: 'red' }}>{error}</p>}

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

          {/* Conditionally render additional fields for Income Statement */}
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

          <button className="blue-button" type="button" onClick={handleDownload}>
            {loading ? 'Downloading...' : 'Download Report'}
          </button>
        </form>
      </div>
    </>
  );
};

export default ReportsComponent;
