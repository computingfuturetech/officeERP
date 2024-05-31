const MemberList = require("../../models/memberModels/memberList");

module.exports = {
  updateMember: async (req, res) => {
    const {
      ms_no,
      area,
      phase,
      purchase_name,
      address,
      cnic_no,
      plot_no,
      block,
    } = req.body;
    try {
      if (ms_no) {
        if (!phase && !purchase_name && !address && !cnic_no) {
          const memberList = await MemberList.find({ msNo: ms_no });
          return res.status(200).json(memberList);
        }
      }
      if (!ms_no || !phase || !purchase_name || !address || !cnic_no) {
        return res.status(400).json({ message: "All fields are required" });
      }
      if (cnic_no.length !== 15) {
        return res.status(400).json({ message: "Invalid CNIC number" });
      }
      const memberList = await MemberList.find({ msNo: ms_no });
      if (memberList.length === 0) {
        return res.status(400).json({ message: "Member does not exist" });
      }
      const member = await MemberList.findOneAndUpdate(
        { msNo: ms_no },
        {
          msNo: ms_no,
          area: area,
          phase: phase,
          purchaseName: purchase_name,
          address: address,
          cnicNo: cnic_no,
          plotNo: plot_no,
          block: block,
        },
        { new: false }
      );
      res.status(200).json({
        message: "Member updated successfully",
        member: member,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
};
