import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { clearSelectedTransaction } from '../redux/slices/transactionSlice'; // ✅
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionList from '../components/transactions/TransactionList';

const TransactionsPage = () => {
  const dispatch = useDispatch();
  const userRole = useSelector((state) => state.wallets.userRole || 'viewer');

  // ✅ Clear selected transaction on initial render
  useEffect(() => {
    dispatch(clearSelectedTransaction());
  }, [dispatch]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>

      {['owner', 'accountant'].includes(userRole) && (
        <TransactionForm userRole={userRole} />
      )}

      <TransactionList userRole={userRole} />
    </div>
  );
};

export default TransactionsPage;
