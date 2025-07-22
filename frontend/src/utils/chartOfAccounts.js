export const buildHierarchy = (accounts) => {
  const accountMap = new Map();
  const roots = [];

  // First pass: create a map of all accounts
  accounts.forEach((account) => {
    accountMap.set(account._id, { ...account, children: [] });
  });

  // Second pass: build the hierarchy
  accounts.forEach((account) => {
    if (account.parent) {
      const parentId =
        typeof account.parent === "object"
          ? account.parent._id
          : account.parent;
      const parent = accountMap.get(parentId);
      if (parent) {
        parent.children.push(accountMap.get(account._id));
      }
    } else {
      roots.push(accountMap.get(account._id));
    }
  });

  return roots;
};