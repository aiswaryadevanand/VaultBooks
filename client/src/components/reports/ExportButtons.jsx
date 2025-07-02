

import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Button from '../ui/Button'; // relative to ExportButtons.jsx




const ExportButtons = ({ lineChart, pieChart, walletChart, summary }) => {
  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('VaultBooks Report', 14, 15);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 23);

    if (summary) {
      doc.setFontSize(14);
      doc.text('Summary', 14, 35);
      autoTable(doc, {
        startY: 40,
        head: [['Total Income', 'Total Expense']],
        body: [[`${summary.totalIncome}`, `${summary.totalExpense}`]],
      });
    }

    if (lineChart) {
      doc.setFontSize(14);
      doc.text('Income vs Expense', 14, doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 60);
      autoTable(doc, {
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 65,
        head: [['Month', 'Income', 'Expense']],
        body: lineChart.labels.map((label, i) => [
          label,
          `${lineChart.incomeData[i]}`,
          `${lineChart.expenseData[i]}`,
        ]),
      });
    }

    if (pieChart) {
      doc.setFontSize(14);
      doc.text('Expense by Category', 14, doc.lastAutoTable.finalY + 10);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [['Category', 'Amount']],
        body: pieChart.labels.map((label, i) => [label, `${pieChart.data[i]}`]),
      });
    }

    if (walletChart) {
      doc.setFontSize(14);
      doc.text('Wallet Performance', 14, doc.lastAutoTable.finalY + 10);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [['Wallet', 'Income', 'Expense']],
        body: walletChart.labels.map((label, i) => [
          label,
          `${walletChart.income[i]}`,
          `${walletChart.expense[i]}`,
        ]),
      });
    }

    doc.save(`VaultBooks_Report_${new Date().toISOString()}.pdf`);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    if (summary) {
      const summarySheet = XLSX.utils.aoa_to_sheet([
        ['Total Income', 'Total Expense'],
        [summary.totalIncome, summary.totalExpense],
      ]);
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
    }

    if (lineChart) {
      const lineData = [
        ['Month', 'Income', 'Expense'],
        ...lineChart.labels.map((label, i) => [
          label,
          lineChart.incomeData[i],
          lineChart.expenseData[i],
        ]),
      ];
      const lineSheet = XLSX.utils.aoa_to_sheet(lineData);
      XLSX.utils.book_append_sheet(wb, lineSheet, 'Income vs Expense');
    }

    if (pieChart) {
      const pieData = [
        ['Category', 'Amount'],
        ...pieChart.labels.map((label, i) => [label, pieChart.data[i]]),
      ];
      const pieSheet = XLSX.utils.aoa_to_sheet(pieData);
      XLSX.utils.book_append_sheet(wb, pieSheet, 'Expense by Category');
    }

    if (walletChart) {
      const walletData = [
        ['Wallet', 'Income', 'Expense'],
        ...walletChart.labels.map((label, i) => [
          label,
          walletChart.income[i],
          walletChart.expense[i],
        ]),
      ];
      const walletSheet = XLSX.utils.aoa_to_sheet(walletData);
      XLSX.utils.book_append_sheet(wb, walletSheet, 'Wallet Performance');
    }

    XLSX.writeFile(wb, `VaultBooks_Report_${new Date().toISOString()}.xlsx`);
  };

  return (
    <div className="flex gap-4 justify-center mt-6">
      <Button onClick={exportToPDF} className="bg-red-600 text-white hover:bg-red-700">
        Export PDF
      </Button>
      <Button onClick={exportToExcel} className="bg-green-600 text-white hover:bg-green-700">
        Export Excel
      </Button>
    </div>
  );
};

export default ExportButtons;
