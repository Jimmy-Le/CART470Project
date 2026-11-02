import { useEffect, useState } from "react";


function Categories({value, onChange, options}) {

  return (
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">Select a Category</option>

      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default Categories;