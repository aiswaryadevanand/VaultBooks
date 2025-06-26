import React from 'react';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionList from '../components/transactions/TransactionList';

const TransactionsPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>
      <TransactionForm />
      <TransactionList />
    </div>
  );
};

export default TransactionsPage;
