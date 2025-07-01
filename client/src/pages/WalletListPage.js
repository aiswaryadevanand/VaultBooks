import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchWallets,
  setSelectedWallet,
  setUserRole
} from "../redux/slices/walletSlice";
import { logout } from "../redux/slices/authSlice"; // ✅ logout action

const WalletListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { wallets, status, error } = useSelector((state) => state.wallets);
 const auth = useSelector((state) => state.auth);
const token = auth?.token;
const user = auth?.user;

  useEffect(() => {
    if (token) {
      dispatch(fetchWallets());
    }
  }, [dispatch, token]);

  

  const getUserRole = (wallet) => {
  const currentUserId = user?._id?.toString(); // ensure string
  const createdById = wallet?.createdBy?.toString(); // ensure string

  if (createdById === currentUserId) return "owner";
  console.log("Wallet ID:", wallet._id);
console.log("CreatedBy:", wallet.createdBy?.toString());
console.log("Current User ID:", user?._id?.toString());

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


  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const getInitial = () => {
    return user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?";
  };
  if (!user || !user._id) {
return (
<p className="text-center text-gray-500 mt-10">
Loading user data...
</p>
);
}

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Top bar with avatar and logout */}
      <div className="flex justify-between items-center mb-6">
  <div>
    <h1 className="text-3xl font-extrabold text-blue-700">VaultBooks</h1>
    <p className="text-sm text-gray-500">Select a wallet to manage your finances</p>
  </div>
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
      {getInitial()}
    </div>
    <button
      onClick={handleLogout}
      className="text-sm text-red-600 hover:underline"
    >
      Logout
    </button>
  </div>
</div>


     {/* Create wallet button — only show when wallets exist */}
{!!wallets.length && (
  <div className="flex justify-end mb-4">
    <button
      onClick={() => navigate("/wallets/create")}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
    >
      + Create Wallet
    </button>
  </div>
)}

      {/* Status messages */}
      {status === "loading" && (
        <p className="text-center text-sm text-gray-500 mb-4">
          Loading wallets...
        </p>
      )}
      {error && (
        <p className="text-center text-red-500 text-sm mb-4">Error: {error}</p>
      )}

      {/* Empty state */}
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

      {/* Wallet list */}
      {!!wallets.length && (
        <div className="space-y-3">
          {wallets.map((wallet) => (
            <div
              key={wallet._id}
              onClick={() => goToDashboard(wallet)}
              className="bg-gray-100 p-4 rounded shadow-sm flex justify-between items-center cursor-pointer hover:bg-gray-200"
            >
              <div>
                <h4 className="font-semibold">{wallet.name}</h4>
                <p className="text-sm text-gray-600 capitalize">
                  {wallet.type} • {getUserRole(wallet)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WalletListPage;
