import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

const InviteUser = () => {
  const { walletId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [password, setPassword] = useState(""); // new
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleInvite = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email || !role) {
      setError("Email and role are required");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:5000/api/wallets/${walletId}/invite`,
        { email, role, password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(`✅ ${res.data.message}`);
      setEmail("");
      setPassword("");
      setRole("viewer");
    } catch (err) {
      setError(err.response?.data?.error || "Error inviting user");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">🔗 Invite User to Wallet</h2>

      <form onSubmit={handleInvite} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Email address</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Assign Role</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="viewer">Viewer</option>
            <option value="accountant">Accountant</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Password <span className="text-sm text-gray-500">(for new users)</span>
          </label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            minLength={6}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Send Invite
        </button>
      </form>

      {message && (
        <p className="mt-4 text-green-600 font-medium text-sm">{message}</p>
      )}
      {error && (
        <p className="mt-4 text-red-600 font-medium text-sm">{error}</p>
      )}

      <div
        className="mt-6 text-sm text-blue-600 hover:underline cursor-pointer"
        onClick={() => navigate(-1)}
      >
        ← Back to Dashboard
      </div>
    </div>
  );
};

export default InviteUser;
