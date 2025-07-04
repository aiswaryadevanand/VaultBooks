import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchWallets,
  setSelectedWallet,
  setUserRole,
} from "../redux/slices/walletSlice";
import Header from "../pages/Header"; 
const WalletListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { wallets, status, error } = useSelector((state) => state.wallets);
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchWallets());
    }
  }, [dispatch, token]);

  const getUserRole = (wallet) => {
    const currentUserId = user?._id?.toString();
    const createdById = wallet?.createdBy?._id?.toString?.() || wallet?.createdBy?.toString?.();


    if (createdById === currentUserId) return "owner";

    const member = wallet.members?.find(
      (m) => m.userId?.toString?.() === currentUserId
    );

    return member?.role || "viewer";
  };

  const goToDashboard = (wallet) => {
    const role = getUserRole(wallet);
    dispatch(setSelectedWallet(wallet));
    dispatch(setUserRole(role));
    navigate(`/wallets/${wallet._id}`);
  };

  if (!user || !user._id) {
    return (
      <p className="text-center text-gray-500 mt-10">
        Loading user data...
      </p>
    );
  }

  return (
    <div>
      <Header /> {/*  Common Header */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Select a Wallet</h2>
            <p className="text-gray-500 text-sm">Manage your finances by choosing a wallet</p>
          </div>

          {!!wallets.length && (
            <button
              onClick={() => navigate("/wallets/create")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              + Create Wallet
            </button>
          )}
        </div>

        {status === "loading" && (
          <p className="text-center text-sm text-gray-500 mb-4">
            Loading wallets...
          </p>
        )}

        {error && (
          <p className="text-center text-red-500 text-sm mb-4">Error: {error}</p>
        )}

        {!wallets.length && status === "succeeded" && (
          <div className="text-center mt-20">
            <p className="text-gray-600 mb-4">You have no wallets yet.</p>
            <button
              onClick={() => navigate("/wallets/create")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              + Create Your First Wallet
            </button>
          </div>
        )}

        {!!wallets.length && (
          <div className="grid sm:grid-cols-2 gap-6">
            {wallets.map((wallet) => (
              <div
                key={wallet._id}
                onClick={() => goToDashboard(wallet)}
                className="bg-white p-6 rounded-xl shadow-md border hover:shadow-lg transition cursor-pointer"
              >
                <h3 className="text-lg font-bold text-gray-800">{wallet.name}</h3>
                <p className="text-sm text-gray-600 mt-1 capitalize">
                  {wallet.type} • {getUserRole(wallet)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletListPage;
