import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { fetchTeam } from "../api/walletAPI";


const Team = () => {
  const { walletId } = useParams();
  const [team, setTeam] = useState([]);
  const [error, setError] = useState("");

  const loadTeam = async () => {
    try {
      const res = await fetchTeam(walletId);
      setTeam(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load team members");
    }
  };

  useEffect(() => {
    if (walletId) loadTeam();
  }, [walletId]);

  return (
    <div className="max-w-2xl mx-auto mt-6 p-4 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">👥 Wallet Team</h2>
      {error && <p className="text-red-600">{error}</p>}
      <ul className="space-y-2">
        {team.map((member, index) => (
          <li key={index} className="border p-3 rounded shadow-sm">
            <p className="font-medium">👤 {member.username || 'Owner'}</p>
            <p className="text-sm text-gray-600">📧 {member.email || '-'}</p>
            <p className="text-sm">🛡️ Role: {member.role}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Team;
