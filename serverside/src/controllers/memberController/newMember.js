const MemberList = require("../../models/memberModels/memberList");

module.exports = {
    
  createMember: async (req, res) => {
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
      if (!ms_no || !phase || !purchase_name || !address || !cnic_no) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const cnicRegex = /^\d{5}-\d{7}-\d$/;
      if (cnic_no.length !== 15 || !cnicRegex.test(cnic_no)) {
        return res.status(400).json({ message: "Invalid CNIC number" });
      }
      const memberList = await MemberList.find({ msNo: ms_no });
      if (memberList.length > 0) {
        return res.status(400).json({ message: "Member already exists" });
      }
  
      const member = new MemberList({
        msNo: ms_no,
        area: area,
        phase: phase,
        purchaseName: purchase_name,
        address: address,
        cnicNo: cnic_no,
        plotNo: plot_no,
        block: block,
      });
      await member.save();
      res.status(200).json({
        message: "Member created successfully",
        member: member,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  }
  
}