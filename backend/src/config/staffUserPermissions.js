module.exports = {
  "Super Admin": {
    dasboard: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    staffUsers: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    memberPlotRecords: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    reports: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    chartOfAccounts: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    vouchers: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    apiTester: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
  },
  Admin: {
    dasboard: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    staffUsers: {
      create: false,
      read: true,
      update: false,
      delete: false,
    },
    memberPlotRecords: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    reports: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    chartOfAccounts: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    vouchers: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    apiTester: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
  },
  Employee: {
    dasboard: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    staffUsers: {
      create: false,
      read: false,
      update: false,
      delete: false,
    },
    memberPlotRecords: {
      create: false,
      read: true,
      update: false,
      delete: false,
    },
    reports: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    apiTester: {
      create: false,
      read: false,
      update: false,
      delete: false,
    },
    chartOfAccounts: {
      create: false,
      read: true,
      update: false,
      delete: false,
    },
    vouchers: {
      create: false,
      read: true,
      update: false,
      delete: false,
    },
  },
};
