
const DelistedMemberList = require("../../models/memberModels/delistedMember");

module.exports = {
    getDelistedMemberList: async (req, res) => {
        const {ms_no}=req.body;
        try {
            let memberList;
        if (ms_no) {
             memberList = await DelistedMemberList.find({ msNo: ms_no });
             }
        else{
            memberList = await DelistedMemberList.find();
        }
        if (memberList.length === 0) {
            return res.status(400).json({ message: "No delisted members found" });
        }
        res.status(200).json(memberList);
        } catch (err) {
        res.status(500).json({ message: err });
        }
    },
    };
