import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ExportButtons = ({ chartRef, labels, incomeData, expenseData }) => {
  const exportPDF = async () => {
    const canvas = await html2canvas(chartRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    pdf.text("Income vs Expense Report", 10, 10);
    pdf.addImage(imgData, 'PNG', 10, 20, 180, 100);
    pdf.save('income_vs_expense.pdf');
  };

  const exportExcel = () => {
    const data = labels.map((label, index) => ({
      Period: label,
      Income: incomeData[index],
      Expense: expenseData[index],
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "income_vs_expense.xlsx");
  };

  return (
    <div className="flex gap-2">
  <button
    onClick={exportPDF}
    className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
  >
    Export PDF
  </button>
  <button
    onClick={exportExcel}
    className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded"
  >
    Export Excel
  </button>
</div>

  );
};

export default ExportButtons;
