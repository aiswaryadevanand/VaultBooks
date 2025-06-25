import React,{useEffect,useState} from 'react';
import { useSelector } from 'react-redux';
import {
    getBudgets,
    createBudget,
    deleteBudget
}from '../api/budgetAPI';

const Budget = () => {
    
    const selectedWallet = useSelector((state) => state.wallets.selectedWallet);
   

    const walletId = selectedWallet ?._id;
    console.log("Selected wallet:", selectedWallet);

    const [budgets, setBudgets] = useState([]);
    const [category, setCategory] = useState('');
    const [limit, setLimit] = useState('');
    
    

    const fetchBudgets = async () => {
        try {
            const res = await getBudgets(walletId);
            setBudgets(res.data);
        } catch (err) {
            alert('Failed to fetch budgets');
        }
    };

    useEffect(() => {
        if (walletId) {
            fetchBudgets();
        }
    }, [walletId]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createBudget({ walletId, category, limit, spent: 0 });
            console.log("Sending walletId:", walletId);

            setCategory('');
            setLimit('');       
            fetchBudgets();
        } catch (err) {
            alert('Failed to create budget');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteBudget(id);
            fetchBudgets();
        } catch (err) {
            alert('Failed to delete budget');
        }
    };
    
  
    return (
        
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4 text-center">💰 Budget Tracker</h2>
            <form onSubmit={handleCreate} className="bg-white shadow p-4 rounded-md mb-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="e.g. Groceries"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Limit (₹)</label>
                    <input
                        type="number"
                        value={limit}
                        onChange={(e) => setLimit(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="e.g. 5000"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md w-full"
                    >
                        ➕ Add Budget
                    </button>
                    </form>

            <div className="space-y-4">
                {budgets.map((budget) => (
                    <div key={budget._id} className="bg-gray-100 p-4 rounded-md flex items-center justify-between shadow">
                        <div>
                            <h3 className="text-lg font-semibold">{budget.category}</h3>
                            <p className="text-sm text-gray-600">₹{budget.spent} / ₹{budget.limit}</p>   
                        </div>
                        <button
                            onClick={() => handleDelete(budget._id)}
                            className="text-red-500 hover:text-red-700 font-medium"
                        >
                            🗑️ Delete
                        </button>
                    </div>
                ))}
                </div>
                </div>
    );
};
export default Budget;
