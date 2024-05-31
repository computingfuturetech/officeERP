const fs = require('fs');
const csvParser = require('csv-parser');

const filePath = 'uploads/NewMemberList.csv';

const memberModel = require('./models/memberModels/memberList');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Test123', {
});


fs.createReadStream(filePath)
  .pipe(csvParser())
  .on('data', (row) =>{
    let data = {
        srNo: parseInt(row["Sr. #"], 10) || 0,
        msNo: row["Mship No. "],
        area: parseFloat(row["AREA "], 10) || 0,
        phase: row["Phase"],
        purchaseName: row["PURCHASER NAME"],
        address: row["ADDRESS"],
        cnicNo: row["CNIC No."],
        plotNo: row["Plot No. "],
        block: row["Block"],
        };
        const member = new memberModel(data);
        member.save();
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });


