import React, { useState, useRef, useEffect } from "react";
import "./style/lineChart.css";

function CustomDropdown({ options, selectedOptions, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleCheckboxChange = (label) => {
    onChange(label);
  };

  const handleDropdownToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="custom-dropdown-button" ref={dropdownRef}>
      <button className="dropdown-button-toggle" onClick={handleDropdownToggle}>
        Select Banks
      </button>
      {isOpen && (
        <div className="dropdown-button-menu">
          {Object.keys(options).map((key) => (
            <label key={key} className="dropdown-button-item">
              <input
                type="checkbox"
                checked={selectedOptions.includes(key)}
                onChange={() => handleCheckboxChange(key)}
              />
              {key}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomDropdown;
