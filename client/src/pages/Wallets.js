import React,{useState,useEffect} from "react";
import { useNavigate } from "react-router-dom"; 
import { useSelector, useDispatch } from "react-redux";

import { 
  fetchWallets,
  createWallet,
  updateWallet,
  deleteWallet,
  setSelectedWallet } from "../redux/slices/walletSlice";  



const Wallets = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wallets, status, error } = useSelector((state) => state.wallets);

  const [formData, setFormData] = useState({name: "", type: 'personal' });
  const [editId,setEditId]=useState(null);
  const [editData, setEditData] = useState({ name: "", type: 'personal' });

  useEffect(() => {
    dispatch(fetchWallets());
  }, [dispatch]);

  const handleCreate = async(e) => {
    e.preventDefault();
    if(!formData.name.trim())return; 
    await dispatch(createWallet(formData));
    setFormData({ name: "", type: 'personal' });
    };

    const handleEdit = (wallet) => {
      setEditId(wallet._id);
      setEditData({ name: wallet.name, type: wallet.type });
    };

    const handleUpdate = async (id) => {
      if (!editData.name.trim()) return;
      await dispatch(updateWallet({ id, ...editData }));
      setEditId(null);
    };

    const handleDelete = async (id) => {
      if (window.confirm("Are you sure you want to delete this wallet?")) {
        await dispatch(deleteWallet(id));
      }
    }

    const goToBudgets = (wallet) => {
      dispatch(setSelectedWallet(wallet));
      navigate(`/wallets/${wallet._id}/budgets`);
    }

    return (
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-2xl font-bold text-center mb-6">💼 Wallets</h2>
        
        <form onSubmit={handleCreate}
          className="flex flex-col md:flex-row items-center gap-4 bg-white shadow p-4 rounded-md mb-6">
          <input
            type="text"
            placeholder="Wallet Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="border border-gray-300 rounded px-3 py-2 w-full md:w-1/2"
          />
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 w-full md:w-1/4"
          >
            <option value="personal">Personal</option>
            <option value="business">Business</option>
          </select>
          <button type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Add</button>
        </form>

        {status === "loading" &&( <p className="text-center text-sm text-gray-500 mb-4">Loading Wallets...</p>)}
        {error && (<p className="text-center text-red-500 text-sm mb-4">Error: {error}</p>)}

        <div className="space-y-3">
          {wallets.map((wallet) => (
            <div key={wallet._id}
            onClick={() => editId !== wallet._id && goToBudgets(wallet)}
             className="bg-gray-100 p-4 rounded shadow-sm flex justify-between items-center cursor-pointer hover:bg-gray-200">
              {editId === wallet._id ? (
                <div className="flex flex-col md:flex-row items-center gap-2 w-full">
                  <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value } )}
                  className="border border-gray-300 rounded px-3 py-2 w-full md:w-1/2"/>
                  <select
                  value={editData.type}
                  onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-2 w-full md:w-1/4">
                    <option value="personal">Personal</option>
                    <option value="business">Business</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(wallet._id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition">Save</button>
                        <button
                        onClick={() => setEditId(null)}
                        className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400 transition">Cancel</button>
                        </div>
                        </div>
              ) : (
                <>
              <div>
                <h4 className="font-semibold">{wallet.name}</h4>
                <p className="text-sm text-gray-600 capitalize">{wallet.type}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(wallet)}
                  className="text-sm text-blue-600 hover:underline">Edit</button>
                <button
                  onClick={() => handleDelete(wallet._id)}
                  className="text-sm text-red-600 hover:underline">Delete</button>
      </div>
      </>)}
         
          </div>
          ))}
          </div>
          </div>
    );
  };
  export default Wallets;