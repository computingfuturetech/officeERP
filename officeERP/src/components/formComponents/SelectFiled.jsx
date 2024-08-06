import React from 'react';

const SelectField = ({ label, name, value, options, onChange }) => (
  <div>
    <label htmlFor={name}>{label}: </label>
    <select name={name} id={name} value={value} onChange={onChange}>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

export default SelectField;
