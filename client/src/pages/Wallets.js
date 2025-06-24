import React,{useState,useEffect} from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchWallets,createWallet } from "../redux/slices/walletSlice";  


const Wallets = () => {
  const dispatch = useDispatch();
  const { wallets, status, error } = useSelector((state) => state.wallets);

  const [formData, setFormData] = useState({name: "", type: 'personal' });

  useEffect(() => {
    dispatch(fetchWallets());
  }, [dispatch]);

  const handleCreate = async(e) => {
    e.preventDefault();
    if(!formData.name.trim())return; 
    await dispatch(createWallet(formData));
    setFormData({ name: "", type: 'personal' });
    };

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
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Create Wallet</button>
        </form>

        {status === "loading" &&( <p className="text-center text-sm text-gray-500 mb-4">Loading Wallets...</p>)}
        {error && (<p className="text-center text-red-500 text-sm mb-4">Error: {error}</p>)}

        <div className="space-y-3">
          {wallets.map((wallet) => (
            <div key={wallet._id} className="bg-gray-100 p-4 rounded shadow-sm flex justify-between items-center">
              <div>
                <h4 className="font-semibold">{wallet.name}</h4>
                <p className="text-sm text-gray-600 capitalize">{wallet.type}</p>
              </div>
              <span className="text-xs text-gray-500">{new Date(wallet.createdAt).toLocaleDateString()}</span>
      </div>
          ))}
          </div>
          </div>
    );
  };
  export default Wallets;