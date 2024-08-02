import React from 'react';

const InputField = ({ label, type, name, value, onChange }) => (
  <div>
    <label htmlFor={name}>{label}: </label>
    <input
      type={type}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
    />
  </div>
);

export default InputField;
