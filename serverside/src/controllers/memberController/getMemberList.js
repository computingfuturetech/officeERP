const MemberList = require("../../models/memberModels/memberList");

module.exports = {
  getMemberList: async (req, res) => {
    const { search, page_no } = req.query;
    const pageSize = 10;
    try {
      let filter = {};
      if (search) {
        if (/^\d+$/.test(search)) {
          filter = {
            $or: [
              { msNo: Number(search) },

              { area: Number(search) }
            ]
          };
        } else {
          const stringFields = ["cnicNo","block", "purchaseName", "guardianName"];
          filter = {
            $or: stringFields.map(field => ({ [field]: { $regex: search, $options: 'i' } }))
          };
        }
      }

      let memberListQuery = MemberList.find(filter);
      if (page_no) {
        memberListQuery = memberListQuery
          .skip((page_no - 1) * pageSize)
          .limit(pageSize);
      }
      const memberList = await memberListQuery.exec();
      const processedMemberList = [];
      const specialEntries = [];

      memberList.forEach(member => {
        let { purchaseName = '', guardianName = '' } = member;
        const [beforePipe, afterPipe] = purchaseName.split('|').map(part => part.trim());
        let extractedNames = beforePipe.split(',').map(name => name.trim()).filter(name => name);
        purchaseName = extractedNames.join(', ');
        if (afterPipe) {
          let guardianNames = afterPipe.split(',').map(name => name.trim()).filter(name => name);
          guardianName = guardianNames.join(', ');
          guardianName = guardianName.replace(/(S\/O|D\/O|W\/O)\s*/g, '').trim();
        }
        const guardianIndicators = ["S/O", "D/O", "W/O"];
        let guardianIndicatorFound = false;
        guardianIndicators.forEach(indicator => {
          if (purchaseName.includes(indicator)) {
            const parts = purchaseName.split(indicator).map(part => part.trim());
            if (parts.length > 1) {
              purchaseName = parts[0];
              guardianName = parts[1].replace(/(S\/O|D\/O|W\/O)\s*/g, '').trim();
              guardianIndicatorFound = true;
            }
          }
        });
        const processedMember = {
          ...member._doc,
          purchaseName,
          guardianName
        };
        const indicatorCount = (purchaseName.match(/W\/O|S\/O|D\/O/g) || []).length;
        if (indicatorCount > 1) {
          specialEntries.push(processedMember);
        } else {
          processedMemberList.push(processedMember);
        }
      });

      res.status(200).json(processedMemberList);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
