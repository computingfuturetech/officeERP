const commonService = require("../common/common.service");
const ChartOfAccounts = require("../../models/chartOfAccounts/chartOfAccounts.model");
const { ApiError } = require("../../utils/error.util");
const voucherService = require("../voucher/voucher.service");
const VoucherEntry = require("../../models/voucherEntry/voucherEntry.model");

async function populateParent(account) {
  try {
    if (!account.parent) return;
    const parentAccount = await ChartOfAccounts.findById(account.parent);
    if (parentAccount) account.parent = parentAccount;
  } catch (error) {
    console.log("Error populating parent in account", error);
  }
}

async function createAccount(data) {
  const createdAccount = await commonService.createDocument(
    ChartOfAccounts,
    data
  );
  await populateParent(createdAccount);
  return createdAccount;
}

async function updateAccount(id, data) {
  const updatedAccount = await commonService.updateDocumentById(
    ChartOfAccounts,
    id,
    data
  );
  await populateParent(updatedAccount);
  return updatedAccount;
}

async function getDescendantAccounts(rootAccountCode) {
  let prefix = rootAccountCode;
  prefix = `${prefix}.`;
  prefix = prefix.replace(/\./g, "\\.");
  const regex = new RegExp(`^${prefix}`);
  const descendants = await ChartOfAccounts.find({ code: regex });
  return descendants;
}

async function deleteAccount(id) {
  // Delete the account
  const deletedAccount = await commonService.deleteDocumentById(
    ChartOfAccounts,
    id
  );
  if (!deletedAccount)
    throw new ApiError(404, "Account not found");

  // Find all descendants of the deleted account
  const descendants = await getDescendantAccounts(deletedAccount.code);
  const descendantIds = descendants.map((d) => d._id);

  // Delete all descendants
  await ChartOfAccounts.deleteMany({ _id: { $in: descendantIds } });

  // Find all voucher entries associated with the deleted accounts
  const voucherEntries = await VoucherEntry.find({
    account: { $in: [deletedAccount._id, ...descendantIds] },
  });

  // Find all vouchers associated with the voucher entries
  let voucherIds = [];
  for (const entry of voucherEntries) {
    voucherIds.push(entry.voucher);
  }
  voucherIds = [...new Set(voucherIds)];

  // Delete all that vouchers
  await voucherService.bulkDeleteVouchers({ _id: { $in: voucherIds } });
}

module.exports = {
  createAccount,
  updateAccount,
  deleteAccount,
  getDescendantAccounts,
};
