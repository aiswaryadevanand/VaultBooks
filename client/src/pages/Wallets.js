import React, {useEffect,useState} from "react";
import axios from "axios";

const Wallets= () => {
    const [wallets, setWallets] = useState([]);
    const [formData, setFormData] = useState({name: "", type: 'personal'});


    useEffect(() => {
        fetchWallets();
    }, []);

    const fetchWallets = async () => {
        try {
            const res=await axios.get("http://localhost:5000/api/wallets");
            setWallets(res.data);
        }catch(err) {
            console.error("Error fetching wallets:", err.response ?.data || err.message);

        }
    };
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5000/api/wallets", formData);
            setFormData({name: "", type: 'personal'}); // Reset form
            fetchWallets(); // Refresh wallet list
        } catch (err) {
            console.error("Error creating wallet:", err.response ?.data || err.message);
        }
    };

    return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-6">💼 Wallets</h2>

      <form
        onSubmit={handleCreate}
        className="flex flex-col md:flex-row items-center gap-4 bg-white shadow p-4 rounded-md mb-6"
      >
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
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add
        </button>
      </form>

      <div className="space-y-3">
        {wallets.map((wallet) => (
          <div
            key={wallet._id}
            className="bg-gray-100 p-4 rounded shadow-sm flex justify-between items-center"
          >
            <div>
              <h4 className="font-semibold">{wallet.name}</h4>
              <p className="text-sm text-gray-600 capitalize">{wallet.type}</p>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(wallet.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wallets;