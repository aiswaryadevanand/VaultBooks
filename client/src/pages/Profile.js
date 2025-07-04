import React from "react";
import { useSelector } from "react-redux";
import Header from "../pages/Header";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <p className="text-center mt-10 text-gray-500">Loading user data...</p>;
  }

  return (
    <>
     <Header />
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded mt-8">
      
      <h2 className="text-2xl font-bold text-blue-700 mb-4">👤 Profile</h2>

      <div className="space-y-4">
        <div className="flex justify-between border-b pb-2">
          <span className="font-semibold text-gray-700">Username:</span>
          <span>{user.username}</span>
        </div>

        <div className="flex justify-between border-b pb-2">
          <span className="font-semibold text-gray-700">Email:</span>
          <span>{user.email}</span>
        </div>

      </div>
    </div>
    </>
  );
};

export default Profile;
