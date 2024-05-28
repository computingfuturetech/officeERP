
const MemberList = require("../../models/memberModels/memberList");

module.exports = {
  getMemberByFilter: async (req, res) => {
    const { ms_no, sr_no, area, cnic_no, block } = req.body;
    try {
      if (ms_no) {
        const memberList = await MemberList.find({ msNo: ms_no });
        res.status(200).json(memberList);
      } else if (sr_no) {
        const memberList = await MemberList.find({ srNo: sr_no });
        res.status(200).json(memberList);
      } else if (area) {
        const memberList = await MemberList.find({ area: area });
        res.status(200).json(memberList);
      } else if (cnic_no) {
        const memberList = await MemberList.find({ cnicNo: cnic_no });
        res.status(200).json(memberList);
      } else if (block) {
        const memberList = await MemberList.find({ block: block });
        res.status(200).json(memberList);
      } else {
        res.status(400).json({ message: "Invalid request" });
      }
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
};

