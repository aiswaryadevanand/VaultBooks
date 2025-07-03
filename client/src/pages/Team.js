
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { fetchTeam } from "../api/walletAPI";
import { User, Mail, Shield, Trash2, CheckCircle } from "lucide-react";
import { Toaster, toast, useToasterStore } from "react-hot-toast";
import ConfirmDialog from "../components/ConfirmDialog";

const Team = () => {
  const { walletId } = useParams();
  const [team, setTeam] = useState([]);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState({ show: false, userId: null });

  const userRole = useSelector((state) => state.wallets.userRole);
  const token = localStorage.getItem("token");

  const { toasts } = useToasterStore();
  const isToastVisible = toasts.some((t) => t.visible);

  useEffect(() => {
    if (!walletId || walletId === "create") return;
    loadTeam();
  }, [walletId]);

  const loadTeam = async () => {
    try {
      const res = await fetchTeam(walletId);
      setTeam(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load team members");
    }
  };

  const updateRole = async (memberId, role) => {
    try {
      await axios.put(
        `http://localhost:5000/api/wallets/${walletId}/members/${memberId}`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Role updated", {
        icon: <CheckCircle className="text-green-600 w-5 h-5" />,
      });
      loadTeam();
    } catch (err) {
      toast.error("Failed to update role", {
        icon: <CheckCircle className="text-red-600 w-5 h-5" />,
      });
    }
  };

  const confirmRemove = (userId) => {
    setConfirm({ show: true, userId });
  };

  const handleRemoveConfirmed = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/wallets/${walletId}/members/${confirm.userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Member removed", {
        icon: <CheckCircle className="text-green-600 w-5 h-5" />,
      });
      loadTeam();
    } catch (err) {
      toast.error("Failed to remove member", {
        icon: <CheckCircle className="text-red-600 w-5 h-5" />,
      });
    } finally {
      setConfirm({ show: false, userId: null });
    }
  };

  if (!walletId || walletId === "create") return null;

  return (
    <div className="relative">
      {/* 🔲 Blur background when toast is visible */}
      {isToastVisible && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/10 z-[998] pointer-events-none transition duration-300" />
      )}

      {/* 🔔 Centered Toaster */}
      <Toaster
        toastOptions={{
          duration: 2000,
          className:
            "bg-white text-black px-6 py-4 rounded-xl shadow-lg border border-gray-200 text-center font-medium animate-fade-in",
          style: {
            fontSize: "1rem",
            maxWidth: "90vw",
            zIndex: 9999,
          },
        }}
        containerStyle={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <div className="max-w-2xl mx-auto mt-6 p-4 bg-white shadow rounded relative z-10">
        <h2 className="text-2xl font-bold mb-4">Wallet Team</h2>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        <ul className="space-y-2">
          {team.map((member, index) => (
            <li
              key={index}
              className="border p-3 rounded shadow-sm flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-700" />
                <span className="font-medium">{member.username || "Owner"}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{member.email || "-"}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <span>Role: {member.role}</span>
                </div>

                {userRole === "owner" && member.role !== "owner" && (
                  <div className="flex items-center gap-3">
                    <select
                      value={member.role}
                      onChange={(e) => updateRole(member.userId, e.target.value)}
                      className="border px-2 py-1 rounded text-sm"
                    >
                      <option value="accountant">Accountant</option>
                      <option value="viewer">Viewer</option>
                    </select>

                    <button
                      onClick={() => confirmRemove(member.userId)}
                      className="text-red-600 hover:text-red-800"
                      title="Remove Member"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>

        {confirm.show && (
          <ConfirmDialog
            message="Are you sure you want to remove this member?"
            onConfirm={handleRemoveConfirmed}
            onCancel={() => setConfirm({ show: false, userId: null })}
          />
        )}
      </div>
    </div>
  );
};

export default Team;
