exports.hasWalletAccess = (wallet, userId, rolesAllowed) => {
  if (wallet.createdBy.toString() === userId && rolesAllowed.includes("owner")) return true;

  const member = wallet.members.find(
    (m) => m.userId.toString() === userId && rolesAllowed.includes(m.role)
  );
  return !!member;
};
