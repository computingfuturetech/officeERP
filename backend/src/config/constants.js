module.exports = {
  ACCOUNT_TYPES: ["Asset", "Liability", "Equity", "Revenue", "Expense"],
  ACCOUNT_TYPE_DEBIT_CREDIT_RULES: {
    Asset: {
      debit: "increase",
      credit: "decrease",
    },
    Liability: {
      debit: "decrease",
      credit: "increase",
    },
    Equity: {
      debit: "decrease",
      credit: "increase",
    },
    Revenue: {
      debit: "decrease",
      credit: "increase",
    },
    Expense: {
      debit: "increase",
      credit: "decrease",
    },
  },
  VOUCHER_TYPES: [
    "Journal Voucher",
    "Bank Payment Voucher",
    "Bank Receipt Voucher",
    "Cash Payment Voucher",
    "Cash Receipt Voucher",
  ],
  VOUCHER_TYPE_ABBREVIATIONS: {
    "Cash Payment Voucher": "CPV",
    "Cash Receipt Voucher": "CRV",
    "Bank Payment Voucher": "BPV",
    "Bank Receipt Voucher": "BRV",
    "Journal Voucher": "JV",
  },
  VOUCHER_STATUSES: ["Pending", "Approved", "Rejected", "Posted"],
  STAFF_USER_ROLES: ["Super Admin", "Admin", "Employee"],
  PLOT_CATEGORIES: ["Residential", "Commercial", "Amenity"],
  PLOT_AREA_UNITS: [
    "sq ft",
    "sq yd",
    "sq m",
    "marla",
    "kanal",
    "acre",
    "ha",
  ],
  MEMBER_PLOT_RECORD_STATUSES: ["Active", "Transferred"],
  EMAIL_REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
};
