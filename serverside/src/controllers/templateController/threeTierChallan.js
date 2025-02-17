const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const ThreeTierChallan = require("../../models/challanModels/threeTierChallan");

exports.renderTemplate = (req, res) => {
  fs.readFile(
    path.join(__dirname, "../../views/threeTierChallan.html"),
    "utf-8",
    (err, html) => {
      if (err) {
        console.error("Error loading template:", err);
        return res.status(500).send("Error loading template");
      }
      const {
        accountNo,
        bankName,
        branchName,
        branchCode,
        challanNo,
        pName,
        date,
        address,
        membershipNo,
        membershipFee,
        developmentCharges,
        additionalDevelopemntCharges,
        landCost,
        transferFee,
        masjidFund,
        miscellaneous,
        totalInWords,
      } = req.body;

      let renderedHtml = html
        .replace("{{accountNo}}", accountNo)
        .replace("{{bankName}}", bankName)
        .replace("{{branchName}}", branchName)
        .replace("{{branchCode}}", branchCode)
        .replace("{{challanNo}}", challanNo)
        .replace("{{date}}", date)
        .replace("{{pName}}", pName)
        .replace("{{addressLine1}}", address)
        .replace("{{membershipNo}}", membershipNo)
        .replace("{{membershipFee}}", membershipFee)
        .replace("{{developmentCharges}}", developmentCharges)
        .replace("{{additionalDevelopemntCharges}}", additionalDevelopemntCharges)
        .replace("{{landCost}}", landCost)
        .replace("{{masjidFund}}", masjidFund)
        .replace('{{transferFee}}', transferFee)
        // .replace("{{total}}",total)
        .replace("{{totalInWords}}", totalInWords)
      res.send(renderedHtml);
    }
  );
};

exports.generatePDF = async (req, res) => {
  fs.readFile(
    path.join(__dirname, "../../views/threeTierChallan.html"),
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
        membershipFee,
        landCost,
        developmentCharges,
        additionalDevelopmentCharges,
        transferFee,
        masjidFund,
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

      console.log(parseInt(transferFee))
      const total =
        parseInt(membershipFee) +
        parseInt(landCost) +
        parseInt(developmentCharges) +
        parseInt(additionalDevelopmentCharges) +
        parseInt(transferFee) +
        parseInt(masjidFund);

      console.log(total)

      const threetierChallan = new ThreeTierChallan({
        pName: pName,
        date: date,
        bankName: bankName,
        address: address,
        branchName: branchName,
        branchCode: branchCode,
        challanNo: challanNo,
        memberShipNo: membershipNo,
        membershipFee: membershipFee,
        developmentCharges: developmentCharges,
        additionalDevelopmentCharges: additionalDevelopmentCharges,
        landCost: landCost,
        masjidFund: masjidFund,
        transferFee: transferFee,
        rupeesInWords: totalInWordsLine1,
        accountNo: accountNo,
        total: total,
      });

      await threetierChallan.save()
        .then(() => console.log("threetierChallan saved"));

      function replacePlaceholders(template, data) {
        return template
          .replace(/{{accountNo}}/g, data.accountNo)
          .replace(/{{bankName}}/g, data.bankName)
          .replace(/{{branchName}}/g, data.branchName)
          .replace(/{{branchCode}}/g, data.branchCode)
          .replace(/{{challanNo}}/g, data.challanNo)
          .replace(/{{date}}/g, data.date)
          .replace(/{{pName}}/g, data.pName)
          .replace(/{{addressLine1}}/g, addressLine1)
          .replace(/{{nextlineAddress}}/g, nextlineAddress)
          .replace(/{{membershipNo}}/g, data.membershipNo)
          .replace(/{{membershipFee}}/g, data.membershipFee)
          .replace(/{{landCost}}/g, data.landCost)
          .replace(/{{transferFee}}/g, data.transferFee)
          .replace(/{{developmentCharges}}/g, data.developmentCharges)
          .replace(/{{additionalDevelopmentCharges}}/g, data.additionalDevelopmentCharges)
          .replace(/{{masjidFund}}/g, data.masjidFund)
          .replace(/{{total}}/g, total)
          .replace(/{{totalInWords}}/g, totalInWordsLine1)
          .replace(/{{nextTotalInWords}}/g, nextTotalInWords);
      }

      const renderedHtml = replacePlaceholders(html, data);

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
