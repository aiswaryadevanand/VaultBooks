import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

const Team = () => {
  const { walletId } = useParams();
  const { token } = useSelector((state) => state.auth);
  const [team, setTeam] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/wallets/${walletId}/team`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTeam(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load team");
      }
    };
    fetchTeam();
  }, [walletId, token]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">👥 Team Members</h2>
      {error && <p className="text-red-500">{error}</p>}

      {team.length === 0 ? (
        <p className="text-gray-500">No members yet.</p>
      ) : (
        <ul className="divide-y divide-gray-300">
          {team.map((member) => (
            <li key={member._id} className="py-2">
              <p className="font-medium">{member.username} ({member.email})</p>
              <p className="text-sm text-gray-600">Role: {member.role}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Team;
