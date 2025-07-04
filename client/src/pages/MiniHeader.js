
import React from "react";
import logo from "../assets/logo192.png";

const MinimalHeader = () => {
  return (
    <header className="bg-gray-900 text-white px-6 py-4 flex items-center shadow-md">
      <div className="flex items-center gap-3">
        <img src={logo} alt="VaultBooks Logo" className="w-10 h-10" />
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-blue-400">
          Vault<span className="text-white">Books</span>
        </h1>
      </div>
    </header>
  );
};

export default MinimalHeader;
