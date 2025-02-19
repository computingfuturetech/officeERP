const MemberList = require("../../models/memberModels/memberList");
const DelistedMemberList = require("../../models/memberModels/delistedMember");
const MemberDeposit = require("../../models/memberModels/memberDeposit");
const CashBook = require("../../models/ledgerModels/cashBookLedger");
const BankLedger = require("../../models/ledgerModels/bankLedger");
const GeneralLedger = require("../../models/ledgerModels/generalLedger");
const { head } = require("../../routes/memberRoutes/member");

module.exports = {
  createMember: async (req, res) => {
    const {
      msNo,
      area,
      phase,
      purchaseName,
      guardianName,
      address,
      cnicNo,
      plotNo,
      block,
      category,
    } = req.body;
    try {
      if (!msNo) {
        return res.status(400).json({
          status: "error",
          message: "Member No is required",
        });
      }
      if (!phase) {
        return res.status(400).json({
          status: "error",
          message: "Phase is required",
        });
      }
      if (!purchaseName) {
        return res.status(400).json({
          status: "error",
          message: "Purchase Name is required",
        });
      }
      if (!address) {
        return res.status(400).json({
          status: "error",
          message: "Address is required",
        });
      }
      if (!cnicNo) {
        return res.status(400).json({
          status: "error",
          message: "CNIC No is required",
        });
      }

      const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;

      if (cnicNo.length !== 15 || !cnicRegex.test(cnicNo)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid CNIC number",
        });
      }

      const memberList = await MemberList.findOne({ msNo: msNo });
      if (memberList) {
        return res.status(409).json({
          status: "error",
          message: "Member already exists",
        });
      }

      const member = new MemberList({
        msNo: msNo,
        area: area,
        phase: phase,
        purchaseName: purchaseName,
        guardianName: guardianName,
        address: address,
        cnicNo: cnicNo,
        plotNo: plotNo,
        block: block,
        category: category,
      });

      await member.save();
      res.status(201).json({
        status: "success",
        message: "Member created successfully",
        data: member,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
  updateMember: async (req, res) => {
    const {
      area,
      phase,
      purchaseName,
      guardianName,
      address,
      cnicNo,
      plotNo,
      block,
      category,
    } = req.body;

    const { id } = req.query;
    try {
      if (!id) {
        return res.status(400).json({
          status: "error",
          message: "Id is required",
        });
      }

      const memberFound = await MemberList.findById(id);
      if (!memberFound) {
        return res.status(404).json({
          status: "error",
          message: "Member does not exist",
        });
      }

      if (area) {
        memberFound.area = area;
      }
      if (phase) {
        memberFound.phase = phase;
      }
      if (purchaseName) {
        memberFound.purchaseName = purchaseName;
      }
      if (guardianName) {
        memberFound.guardianName = guardianName;
      }
      if (address) {
        memberFound.address = address;
      }
      if (cnicNo) {
        const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
        if (cnicNo.length !== 15 || !cnicRegex.test(cnicNo)) {
          return res.status(400).json({
            status: "error",
            message: "Invalid CNIC number",
          });
        }
        memberFound.cnicNo = cnicNo;
      }
      if (plotNo) {
        memberFound.plotNo = plotNo;
      }
      if (block) {
        memberFound.block = block;
      }
      if (category) {
        memberFound.category = category;
      }

      await memberFound.save();
      res.status(200).json({
        status: "success",
        message: "Member updated successfully",
        data: memberFound,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
  getMemberList: async (req, res) => {
    try {
      const {
        msNo,
        category,
        area,
        phase,
        purchaseName,
        cnicNo,
        plotNo,
        block,
        page = 1,
        limit = 10,
      } = req.query;

      let filter = {};

      if (msNo) filter.msNo = msNo;
      if (category) filter.category = category;
      if (area) filter.area = Number(area);
      if (phase) filter.phase = phase;
      if (purchaseName) filter.purchaseName = purchaseName;
      if (cnicNo) filter.cnicNo = cnicNo;
      if (plotNo) filter.plotNo = plotNo;
      if (block) filter.block = block;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { srNo: 1 },
      };

      const members = await MemberList.paginate(filter, options);

      return res.status(200).json({
        status: "success",
        message:
          members.docs.length === 0 ? "No members found" : "Members found",
        data: members.docs,
        pagination: {
          totalDocs: members.totalDocs,
          totalPages: members.totalPages,
          currentPage: members.page,
          limit: members.limit,
          hasNextPage: members.hasNextPage,
          hasPrevPage: members.hasPrevPage,
        },
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: err.message || "Internal Server Error",
      });
    }
  },
  getDelistedMemberList: async (req, res) => {
    try {
      const {
        msNo,
        area,
        phase,
        purchaseName,
        cnicNo,
        plotNo,
        block,
        page = 1,
        limit = 10,
      } = req.query;

      let filter = {};

      if (msNo) filter.msNo = msNo;
      if (area) filter.area = Number(area);
      if (phase) filter.phase = phase;
      if (purchaseName) filter.purchaseName = purchaseName;
      if (cnicNo) filter.cnicNo = cnicNo;
      if (plotNo) filter.plotNo = plotNo;
      if (block) filter.block = block;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { delistedDate: -1 },
      };

      const members = await DelistedMemberList.paginate(filter, options);

      // if (!members || members.docs.length === 0) {
      //   return res.status(404).json({
      //     status: "error",
      //     message: "No delisted members found with the provided criteria",
      //   });
      // }

      return res.status(200).json({
        status: "success",
        message: "Delisted Members found",
        data: members.docs,
        pagination: {
          totalDocs: members.totalDocs,
          totalPages: members.totalPages,
          currentPage: members.page,
          limit: members.limit,
          hasNextPage: members.hasNextPage,
          hasPrevPage: members.hasPrevPage,
        },
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: err.message || "Internal Server Error",
      });
    }
  },
  transferMembership: async (req, res) => {
    const { purchaseName, address, cnicNo, guardianName } = req.body;
    const { id } = req.query;
    try {
      if (!id) {
        return res.status(400).json({
          status: "error",
          message: "Id is required",
        });
      }
      const member = await MemberList.findById(id);
      if (!member) {
        return res.status(404).json({
          status: "error",
          message: "Member does not exist",
        });
      }
      if (!purchaseName) {
        return res.status(400).json({
          status: "error",
          message: "Purchase Name is required",
        });
      }
      if (!guardianName) {
        return res.status(400).json({
          status: "error",
          message: "Guardian Name is required",
        });
      }
      if (!address) {
        return res.status(400).json({
          status: "error",
          message: "Address is required",
        });
      }
      if (!cnicNo) {
        return res.status(400).json({
          status: "error",
          message: "CNIC No is required",
        });
      }

      const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
      if (cnicNo.length !== 15 || !cnicRegex.test(cnicNo)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid CNIC number",
        });
      }

      const delistedMember = new DelistedMemberList({
        msNo: member.msNo,
        area: member.area,
        phase: member.phase,
        purchaseName: member.purchaseName,
        address: member.address,
        cnicNo: member.cnicNo,
        plotNo: member.plotNo,
        block: member.block,
      });
      await delistedMember.save();

      member.purchaseName = purchaseName;
      member.guardianName = guardianName;
      member.address = address;
      member.cnicNo = cnicNo;

      await member.save();
      res.status(200).json({
        status: "success",
        message: "Member transferred successfully",
        data: member,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
  memberDeposit: async (req, res) => {
    const {
      msNo,
      challanNo,
      amount,
      type,
      bank,
      particular,
      chequeNo,
      voucherNo,
      headOfAccount,
    } = req.body;
    try {
      if (!msNo) {
        return res.status(400).json({
          status: "error",
          message: "Member No is required",
        });
      }
      if (!challanNo) {
        return res.status(400).json({
          status: "error",
          message: "Challan No is required",
        });
      }
      if (!amount) {
        return res.status(400).json({
          status: "error",
          message: "Amount is required",
        });
      }
      if (!type) {
        return res.status(400).json({
          status: "error",
          message: "Type is required",
        });
      }
      if (type === "bank" && (!bank || !headOfAccount)) {
        return res.status(400).json({
          status: "error",
          message: "Bank is required",
        });
      }
      const memberFound = await MemberList.findOne({ msNo: msNo });
      if (!memberFound) {
        return res.status(400).json({
          status: "error",
          message: "Member not found",
        });
      }
      const memberDeposit = new MemberDeposit({
        msNo: msNo,
        challanNo: challanNo,
        amount: amount,
        type: type,
      });
      const generalLedger = new GeneralLedger({
        type: type,
        headOfAccount: "Member Deposit",
        particular: particular,
        chequeNo: chequeNo,
        challanNo: challanNo,
        voucherNo: voucherNo,
        credit: amount,
      });
      const OpeningBalanceOfLastCashBook = await CashBook.find()
        .sort([["_id", -1]])
        .limit(1);
      const OpeningBalanceOfLastBankLedger = await BankLedger.find()
        .sort([["_id", -1]])
        .limit(1);
      console.log(bank);
      if (memberFound) {
        let check = req.body.type;
        if (check === "cash") {
          const cashBook = new CashBook({
            voucherNo: challanNo,
            credit: amount,
            openingBalance:
              OpeningBalanceOfLastCashBook.length === 0
                ? amount
                : OpeningBalanceOfLastCashBook[0].openingBalance === undefined
                ? amount
                : parseInt(OpeningBalanceOfLastCashBook[0].openingBalance) +
                  parseInt(amount),
          });
          await cashBook.save().then(() => console.log("cash saved"));
        } else if (check === "bank") {
          console.log("bank");
          console.log(OpeningBalanceOfLastBankLedger);
          console.log(OpeningBalanceOfLastBankLedger[0].openingBalance);
          console.log(bank);
          console.log(headOfAccount);
          console.log(amount);
          const bankLedger = new BankLedger({
            voucherNo: challanNo,
            credit: amount,
            openingBalance:
              OpeningBalanceOfLastBankLedger.length === 0
                ? amount
                : OpeningBalanceOfLastBankLedger[0].openingBalance === undefined
                ? amount
                : parseInt(OpeningBalanceOfLastBankLedger[0].openingBalance) +
                  parseInt(amount),
            incomeHeadOfAccount: headOfAccount,
            bank: bank,
          });
          await bankLedger.save().then(() => console.log("bank saved"));
        }
        await memberDeposit
          .save()
          .then(() => console.log("Member Deposit Saved"));
        await generalLedger
          .save()
          .then(() => console.log("General Ledger Saved"));
      } else console.log("Not found");
      res.status(200).json({
        status: "success",
        message: "Member deposit successfully",
        data: memberDeposit,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
};
