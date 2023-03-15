import React from 'react';

const FormField = ({ labelName, placeholder, inputType, isTextArea, value, handleChange, readOnly, light }) => {
  return (
    <label className="flex-1 w-full flex flex-col">
      {labelName && (
        <span className={`font-epilogue font-medium text-[14px] leading-[22px] text-[#808191] mb-[10px] ${light && 'text-[#999999]'}`}>{labelName}</span>
      )}
      {isTextArea ? (
        <textarea 
          required
          value={value}
          onChange={handleChange}
          rows={10}
          placeholder={placeholder}
        />
      ) : (
        <input 
          required
          value={value}
          onChange={handleChange}
          readOnly={readOnly}
          type={inputType}
          step="0.1"
          placeholder={placeholder}
        />
      )}
    </label>
  );
}

export default FormField;
