const MemberList = require("../../models/memberModels/memberList");

module.exports = {
  getMemberList: async (req, res) => {
    try {
      const memberList = await MemberList.find();
      res.status(200).json(memberList);
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
};
