const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const SingleTierChallan = require("../../models/challanModels/singleTierChallan");

exports.generatePDF = async (req, res) => {
  fs.readFile(
    path.join(__dirname, "../../views/singleTierChallan.html"),
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

      address = address || '';
      totalInWords = totalInWords || '';

      function splitAddress(address, maxLength = 150) {
        let firstLine, secondLine;
      
        if (address.length > maxLength) {
          let splitIndex = address.lastIndexOf(' ', maxLength);
          if (splitIndex === -1) {
            splitIndex = maxLength;
          }
      
          firstLine = address.substring(0, splitIndex).trim();
          secondLine = address.substring(splitIndex).trim();
        } else {
          firstLine = address;
          secondLine = '';
        }
      
        return { firstLine, secondLine };
      }

      const { firstLine: addressLine1, secondLine: nextlineAddress } = splitAddress(address);

      function splitTotalInWords(totalInWords, maxLength = 150) {
        let firstPart, secondPart;

        if (totalInWords.length > maxLength) {
          let splitIndex = totalInWords.lastIndexOf(' ', maxLength);
          if (splitIndex === -1) {
            splitIndex = maxLength;
          }

          firstPart = totalInWords.substring(0, splitIndex).trim();
          secondPart = totalInWords.substring(splitIndex).trim();
        } else {
          firstPart = totalInWords;
          secondPart = '';
        }

        return { firstPart, secondPart };
      }

      const { firstPart: totalInWordsLine1, secondPart: nextTotalInWords } = splitTotalInWords(totalInWords);

      const total =
        parseInt(possessionFee) +
        parseInt(waterCharges) +
        parseInt(electricityFee) +
        parseInt(construction) +
        parseInt(masjidFund);

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
        totalInWords: totalInWordsLine1,
        accountNo: accountNo,
        total: total,
      });

      await singletierChallan.save()
        .then(() => console.log("singletierChallan saved"));

      if (miscellaneous === undefined) {
        data.miscellaneous = "";
      }

      let renderedHtml = html
        .replace("{{accountNo}}", data.accountNo)
        .replace("{{bankName}}", data.bankName)
        .replace("{{branchName}}", data.branchName)
        .replace("{{branchCode}}", data.branchCode)
        .replace("{{challanNo}}", data.challanNo)
        .replace("{{date}}", data.date)
        .replace("{{pName}}", data.pName)
        .replace("{{address}}", addressLine1)
        .replace("{{nextlineAddress}}", nextlineAddress)
        .replace("{{membershipNo}}", data.membershipNo)
        .replace("{{possessionFee}}", data.possessionFee)
        .replace("{{waterCharges}}", data.waterCharges)
        .replace("{{electricityFee}}", data.electricityFee)
        .replace("{{construction}}", data.construction)
        .replace("{{masjidFund}}", data.masjidFund)
        .replace("{{miscellaneous}}", data.miscellaneous)
        .replace("{{total}}", total)
        .replace("{{totalInWords}}", totalInWordsLine1)
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
