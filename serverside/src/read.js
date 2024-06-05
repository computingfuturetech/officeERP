const fs = require('fs');
const csvParser = require('csv-parser');
const filePath = 'uploads/cashbook.csv';
// const { excelDateToJsDate, jsDateToStringDateFormat } = require('@tofusoup429/excel-date-handlers');
const memberModel = require('./models/memberModels/memberList');
const bankModel = require('./models/ledgerModels/bankLedger');
const cashModel = require('./models/ledgerModels/cashBookLedger');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Test123', {
});

// memberlist.csv
// fs.createReadStream(filePath)
//   .pipe(csvParser())
//   .on('data', (row) =>{
//     let data = {
//         srNo: parseInt(row["Sr. #"], 10) || 0,
//         msNo: row["Mship No. "],
//         area: parseFloat(row["AREA "], 10) || 0,
//         phase: row["Phase"],
//         purchaseName: row["PURCHASER NAME"],
//         address: row["ADDRESS"],
//         cnicNo: row["CNIC No."],
//         plotNo: row["Plot No. "],
//         block: row["Block"],
//         };
//         const member = new memberModel(data);
//         member.save();
//   })
//   .on('end', () => {
//     console.log('CSV file successfully processed');
//   });

function getJsDateFromExcel(excelDate) {
  const SECONDS_IN_DAY = 24 * 60 * 60;
  const MAGIC_NUMBER_OF_DAYS = 25567 + 1;
  return new Date((excelDate - MAGIC_NUMBER_OF_DAYS) * SECONDS_IN_DAY * 1000);
}


 // bankledger1.csv
  // fs.createReadStream(filePath)
  // .pipe(csvParser())
  // .on('data', (row) => {
  //   const excelDate = row["DATE"];
  //   const jsDate = getJsDateFromExcel(excelDate);
  //   const formattedDate = jsDate.toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
  //   console.log(formattedDate);
  //   let data = {
  //     date: formattedDate,
  //     challanNo: parseInt(row["CHLN #"], 10) || 0,
  //     chequeNo: parseFloat(row["M # & CHQ #"], 10) || 0,
  //     headOfAccount: row["PARTICULARS"],
  //     particulars: row["NARRATION"],
  //     voucherNo: row["VR #"],
  //     debit: row["CREDIT(RS.)"],
  //     credit: row["DEBIT(RS.)"],
  //     };
  //     const bank = new bankModel(data);
  //    bank.save();
  // })
  // .on('end', () => {
  //   console.log('CSV file successfully processed');
  // });


// bankledger2.csv
// let rowCounter = 0;

// fs.createReadStream(filePath)
//  .pipe(csvParser())
//  .on('data', (row) => {
//     rowCounter++;
//     if (rowCounter % 2 === 1) { // process every odd-numbered row (1, 3, 5,...)
//       const excelDate = row["DATE"];
//       const jsDate = getJsDateFromExcel(excelDate);
//       const formattedDate = jsDate.toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
//       console.log(formattedDate);
//       let data = {
//         date: formattedDate,
//         challanNo: parseInt(row["CHLN #"], 10) || 0,
//         chequeNo: parseFloat(row["M # & CHQ #"], 10) || 0,
//         headOfAccount: row["PARTICULARS"],
//         particulars: row["NARRATION"],
//         voucherNo: row["VR #"],
//         debit: row["DEBIT(RS.)"],
//         credit: row["CREDIT(RS.)"],
//       };
//       const bank = new bankModel(data);
//       bank.save();
//     }
//   })
//  .on('end', () => {
//     console.log('CSV file successfully processed');
//   });



 // cashbook.csv
  fs.createReadStream(filePath)
  .pipe(csvParser())
  .on('data', (row) => {
    const excelDate = row["DATE"];
    console.log(excelDate)
    const jsDate = getJsDateFromExcel(excelDate);
    const formattedDate = jsDate.toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
    console.log(formattedDate);
    let data = {
      date: formattedDate,
      challanNo: parseInt(row["CHLN #"], 10) || 0,
      chequeNo: parseFloat(row["M # & CHQ #"], 10) || 0,
      headOfAccount: row["HEAD OF ACCOUNT"],
      particulars: row["PARTICULARS"],
      voucherNo: row["VR#"],
      debit: row["CREDIT(RS.)"],
      credit: row["DEBIT(RS.)"],
      openingBalance: row["BALANCE(RS.)"]
      };
      const cash = new cashModel(data);
     cash.save();
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });