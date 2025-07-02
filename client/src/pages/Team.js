import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { fetchTeam } from "../api/walletAPI";

const Team = () => {
  const { walletId } = useParams();
  const [team, setTeam] = useState([]);
  const [error, setError] = useState("");

  const userRole = useSelector((state) => state.wallets.userRole);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!walletId || walletId === "create") return;

    const loadTeam = async () => {
      try {
        const res = await fetchTeam(walletId);
        setTeam(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load team members");
      }
    };

    loadTeam();
  }, [walletId]);

  const updateRole = async (memberId, role) => {
    try {
      await axios.put(
        `http://localhost:5000/api/wallets/${walletId}/members/${memberId}`,
        { role },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchUpdatedTeam();
    } catch (err) {
      alert("❌ Failed to update role");
    }
  };

  const removeMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/wallets/${walletId}/members/${memberId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchUpdatedTeam();
    } catch (err) {
      alert("❌ Failed to remove member");
    }
  };

  const fetchUpdatedTeam = async () => {
    try {
      const res = await fetchTeam(walletId);
      setTeam(res.data);
    } catch (err) {
      console.error("Error refreshing team", err);
    }
  };

  if (!walletId || walletId === "create") return null;

  return (
    <div className="max-w-2xl mx-auto mt-6 p-4 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">👥 Wallet Team</h2>
      {error && <p className="text-red-600">{error}</p>}
      <ul className="space-y-2">
        {team.map((member, index) => (
          <li key={index} className="border p-3 rounded shadow-sm">
            <p className="font-medium">👤 {member.username || "Owner"}</p>
            <p className="text-sm text-gray-600">📧 {member.email || "-"}</p>
            <p className="text-sm mb-1">🛡️ Role: {member.role}</p>

            {/* Actions for owner */}
            {userRole === "owner" && member.role !== "owner" && (
              <div className="flex flex-col md:flex-row gap-3 mt-2">
                <select
                  value={member.role}
                  onChange={(e) => updateRole(member.userId, e.target.value)}
                  className="border px-2 py-1 rounded"
                >
                  <option value="accountant">Accountant</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button
                  onClick={() => removeMember(member.userId)}
                  className="text-red-600 hover:underline"
                >
                  🗑️ Remove
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Team;
