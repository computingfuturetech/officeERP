const DelistedMemberList = require("../../models/memberModels/delistedMember");
const MemberList = require("../../models/memberModels/memberList");

module.exports = {
  transferMembership: async (req, res) => {
    const { ms_no, purchase_name, address, cnic_no } = req.body;
    try {
      if (!ms_no || !purchase_name || !address || !cnic_no) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const member = await MemberList.find({ msNo: ms_no });
      if (member.length === 0) {
        return res.status(400).json({ message: "Member does not exist" });
      }
      const delistedMember = new DelistedMemberList({
        srNo: member[0].srNo,
        msNo: ms_no,
        area: member[0].area,
        phase: member[0].phase,
        purchaseName: member[0].purchaseName,
        address: member[0].address,
        cnicNo: member[0].cnicNo,
        plotNo: member[0].plotNo,
        block: member[0].block,
      });
      await delistedMember.save();
      console.log(delistedMember);
      const updateMember = await MemberList.findOneAndUpdate(
        { msNo: ms_no },
        {
          purchaseName: purchase_name,
          address: address,
          cnicNo: cnic_no,
        },
        { new: false }
      );
      res.status(200).json({
        message: "Member transferred successfully",
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
};
