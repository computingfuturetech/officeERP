const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const SingleTierChallan= require("../../models/challanModels/singleTierChallan")

// exports.renderTemplate = (req, res) => {
//   fs.readFile(
//     path.join(__dirname, "../../views/index.html"),
//     "utf-8",
//     (err, html) => {
//       if (err) {
//         console.error("Error loading template:", err);
//         return res.status(500).send("Error loading template");
//       }
//       const data = ({
//         accountNo,
//         bankName,
//         branchName,
//         branchCode,
//         challanNo,
//         pName,
//         date,
//         address,
//         membershipNo,
//         possessionFee,
//         waterCharges,
//         electricityFee,
//         construction,
//         masjidFund,
//         miscellaneous,
//         totalInWords,
//       } = req.body);

//       const total= parseInt(possessionFee) + parseInt(waterCharges) + parseInt(electricityFee) + parseInt(construction) + parseInt(masjidFund)

//       console.log(total)


//       if(miscellaneous===undefined)
//         {
//             data.miscellaneous=''
//         }

//       let renderedHtml = html
//         .replace("{{accountNo}}", data.accountNo)
//         .replace("{{bankName}}", data.bankName)
//         .replace("{{branchName}}", data.branchName)
//         .replace("{{branchCode}}", data.branchCode)
//         .replace("{{challanNo}}", data.challanNo)
//         .replace("{{date}}", data.date)
//         .replace("{{pName}}", data.pName)
//         .replace("{{address}}", data.address)
//         // .replace("{{nextlineAddress}}", nextlineAddress)
//         .replace("{{membershipNo}}", data.membershipNo)
//         .replace("{{possessionFee}}", data.possessionFee)
//         .replace("{{waterCharges}}", data.waterCharges)
//         .replace("{{electricityFee}}", data.electricityFee)
//         .replace("{{construction}}", data.construction)
//         .replace("{{masjidFund}}", data.masjidFund)
//         .replace('{{miscellaneous}}', data.miscellaneous)
//         .replace("{{total}}",total)
//         .replace("{{totalInWords}}", data.totalInWords)
//         // .replace("{{nextTotalInWords}}", nextTotalInWords);
//       res.send(renderedHtml);
//     }
//   );
// };

exports.generatePDF = async (req, res) => {
  fs.readFile(
    path.join(__dirname, "../../views/index.html"),
    "utf-8",
    async (err, html) => {
      if (err) {
        console.error("Error loading template:", err);
        return res.status(500).send("Error loading template");
      }
      const data = ({
        accountNo,
        bankName,
        branchName,
        branchCode,
        challanNo,
        pName,
        date,
        address,
        membershipNo,
        possessionFee,
        waterCharges,
        electricityFee,
        construction,
        masjidFund,
        miscellaneous,
        totalInWords,
      } = req.body);

      if (address.length >= 190) {
        var nextAddress = address.substring(190);
        var nextlineAddress = nextAddress;
      } else {
        var nextlineAddress = "";
      }

      if (totalInWords.length >= 150) {
        var nextwords = address.substring(190);
        var nextTotalInWords = nextwords;
      } else {
        var nextTotalInWords = "";
      }

      const total= parseInt(possessionFee) + parseInt(waterCharges) + parseInt(electricityFee) + parseInt(construction) + parseInt(masjidFund)


      const singletierChallan = new SingleTierChallan({
        pName: pName,
        date: date,
        bankName: bankName,
        address: address,
        branchName: branchName,
        branchCode: branchCode,
        challanNo: challanNo,
        memberShipNo: membershipNo,
        possessionFee: possessionFee,
        waterCharges: waterCharges,
        electricityFee: electricityFee,
        construction: construction,
        masjidFund: masjidFund,
        miscellaneous: miscellaneous,
        totalInWords: totalInWords,
        accountNo: accountNo,
        total: total,
      });

      await singletierChallan.save().then(() => console.log("singletierChallan saved"));



      if(miscellaneous===undefined)
        {
            data.miscellaneous=''
        }

      let renderedHtml = html
        .replace("{{accountNo}}", data.accountNo)
        .replace("{{bankName}}", data.bankName)
        .replace("{{branchName}}", data.branchName)
        .replace("{{branchCode}}", data.branchCode)
        .replace("{{challanNo}}", data.challanNo)
        .replace("{{date}}", data.date)
        .replace("{{pName}}", data.pName)
        .replace("{{address}}", data.address)
        .replace("{{nextlineAddress}}", nextlineAddress)
        .replace("{{membershipNo}}", data.membershipNo)
        .replace("{{possessionFee}}", data.possessionFee)
        .replace("{{waterCharges}}", data.waterCharges)
        .replace("{{electricityFee}}", data.electricityFee)
        .replace("{{construction}}", data.construction)
        .replace("{{masjidFund}}", data.masjidFund)
        .replace('{{miscellaneous}}', data.miscellaneous)
        .replace("{{total}}", total)
        .replace("{{totalInWords}}", data.totalInWords)
        .replace("{{nextTotalInWords}}", nextTotalInWords);

      try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(renderedHtml, { waitUntil: "networkidle0" });
        const pdfBuffer = await page.pdf({ format: "A4" });

        await browser.close();

        res.setHeader("Content-type", "application/pdf");
        res.send(pdfBuffer);
      } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).send("Error generating PDF");
      }
    }
  );
};
