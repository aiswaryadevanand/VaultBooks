import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/slices/authSlice";
import { User, Home } from "lucide-react";
import logo from "../assets/logo192.png"; // your uploaded logo
import { BiWalletAlt } from "react-icons/bi";

const Header = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md w-full z-50">
      {/* Left: Logo and Brand */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="VaultBooks Logo" className="w-10 h-10" />
        <h1 className="text-3xl font-extrabold tracking-wide text-blue-400">
          Vault<span className="text-white">Books</span>
        </h1>
      </div>

      {/* Right: Greeting, Home, Avatar */}
      <div className="relative flex items-center gap-4">
        {/* Greeting */}
        <span className="hidden sm:block text-sm text-white font-medium">
          Hi, {user?.username || "User"}
        </span>

        {/* Home button */}
        <button
          onClick={() => navigate("/wallets-list")}
          className="flex items-center gap-1 text-sm hover:text-blue-400 transition"
          title="Go to Wallets"
        >
          <BiWalletAlt className="w-6 h-6 text-indigo-700" />
<span className="hidden sm:inline font-medium text-white-700">My Wallets</span>
        </button>

        {/* Avatar (user icon) */}
        <button
          onClick={toggleMenu}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 transition"
          title="Menu"
        >
          <User className="w-5 h-5 text-white" />
        </button>

        {/* Dropdown menu */}
        {/* Dropdown menu */}
{menuOpen && (
  <div className="absolute right-0 top-full mt-2 w-48 bg-white text-gray-800 border rounded shadow z-50">
    <button
      onClick={() => {
        navigate("/profile");
        setMenuOpen(false);
      }}
      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
    >
      Profile
    </button>
    <button
      onClick={() => {
        navigate("/reset-password");
        setMenuOpen(false);
      }}
      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
    >
      Reset Password
    </button>
    <button
      onClick={handleLogout}
      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
    >
      Logout
    </button>
  </div>
)}

      </div>
    </header>
  );
};

export default Header;
