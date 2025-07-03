// components/MonthYearPicker.jsx
import React from 'react';

const months = [
  { label: 'January', value: '01' },
  { label: 'February', value: '02' },
  { label: 'March', value: '03' },
  { label: 'April', value: '04' },
  { label: 'May', value: '05' },
  { label: 'June', value: '06' },
  { label: 'July', value: '07' },
  { label: 'August', value: '08' },
  { label: 'September', value: '09' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

const MonthYearPicker = ({ value, onChange }) => {
  const [year, month] = value ? value.split('-') : ['', ''];

  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    onChange(`${year || currentYear}-${newMonth}`);
  };

  const handleYearChange = (e) => {
    const newYear = e.target.value;
    onChange(`${newYear}-${month || '01'}`);
  };

  return (
    <div className="flex gap-2">
      <select
        value={month}
        onChange={handleMonthChange}
        className="border px-2 py-1 rounded text-sm"
      >
        <option value="">Month</option>
        {months.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      <select
        value={year}
        onChange={handleYearChange}
        className="border px-2 py-1 rounded text-sm"
      >
        <option value="">Year</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MonthYearPicker;
