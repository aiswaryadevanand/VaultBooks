
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import toast, { Toaster, useToasterStore } from "react-hot-toast";
import { ChevronLeft, CheckCircle } from "lucide-react";

const InviteUser = () => {
  const { walletId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [password, setPassword] = useState("");

  const { toasts } = useToasterStore();
  const isToastVisible = toasts.some((t) => t.visible);

  const handleInvite = async (e) => {
    e.preventDefault();

    if (!email || !role) {
      toast.error("Email and role are required");
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

      toast.success(res.data.message || "User invited", {
        icon: <CheckCircle className="text-green-600" />,
      });

      setEmail("");
      setPassword("");
      setRole("viewer");
    } catch (err) {
      toast.error(err.response?.data?.error || "Error inviting user");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg relative z-10">
      {/* Back Icon */}
      <div
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-blue-600 text-sm  cursor-pointer absolute top-4 left-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Back 
      </div>

      
      {isToastVisible && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 z-40 transition duration-300" />
      )}
      <Toaster
        toastOptions={{
          duration: 3000,
          className:
            "bg-white text-black px-6 py-4 rounded-xl shadow-lg border border-gray-200 text-center font-medium animate-fade-slide",
        }}
        containerStyle={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
        }}
      />

      <h2 className="text-2xl font-bold mb-6 text-center">Invite User to Wallet</h2>

      <form onSubmit={handleInvite} className="space-y-4 mt-4">
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
    </div>
  );
};

export default InviteUser;
