const PDFDocument = require('pdfkit');
const IncomeHeadOfAccount = require('../../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount');
const Income = require('../../models/incomeModels/income/income');

module.exports = {
    generatePDF: async (req, res) => {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({ message: "Start Date and EndDate are Required" });
            }

            const sdate = new Date(startDate);
            const formattedSDate = sdate.toLocaleDateString('en-CA');

            const edate = new Date(endDate);
            const formattedEDate = edate.toLocaleDateString('en-CA');

            const incomeRecords = await Income.find({ startDate: startDate, endDate: endDate });

            if (!incomeRecords.length) {
                return res.status(404).json({ message: "No income records found for the specified date range." });
            }

        
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=incomeRecord.pdf');

            const doc = new PDFDocument();
            doc.pipe(res); 

            const containerWidth = 500;
            const pageMargin = 50;
            let currentY = 170;
            const rowHeight = 20;
            let totalAmount = 0; 

            doc.font('Helvetica');

            doc.fontSize(11).text('START DATE', pageMargin, 50);
            doc.rect(pageMargin, 70, 140, 20).stroke();
            doc.text(formattedSDate, pageMargin + 10, 75);

            doc.fontSize(11).text('END DATE', 400, 50);
            doc.rect(400, 70, 140, 20).stroke();
            doc.text(formattedEDate, 410, 75);

            const headerOffsetY = 120; 
            doc.fontSize(16).fillColor('white').rect(pageMargin, headerOffsetY, containerWidth, 40).fill('#3f4d61');
            doc.fillColor('white').text('Head of Account', pageMargin + 30, headerOffsetY + 15, { width: 200, align: 'center' });
            doc.text('Amount', pageMargin + 330, headerOffsetY + 15, { width: 70, align: 'center' });

 
            for (const record of incomeRecords) {
                for (const amount of record.headOfAccountAmount) {
                    const nameHeadOfAccount = await IncomeHeadOfAccount.findById(amount.id);

                    if (nameHeadOfAccount) {
                        totalAmount += amount.amount; 

                        const rowFill = currentY % 2 === 0 ? '#f9f9f9' : '#ffffff';
                        doc.fillColor(rowFill).rect(pageMargin, currentY, containerWidth, rowHeight).fill();

                        doc.fillColor('black').fontSize(10);
                        doc.text(nameHeadOfAccount.headOfAccount, pageMargin + 30, currentY + 5, { width: 200, align: 'center' });
                        doc.text(amount.amount.toFixed(2), pageMargin + 330, currentY + 5, { width: 70, align: 'center' });

                        currentY += rowHeight; 
                    }
                }
            }

            currentY += 20; 
            doc.fontSize(12).text('Total Amount', pageMargin + 30, currentY, { width: 200, align: 'center' });
            doc.text(totalAmount.toFixed(2), pageMargin + 330, currentY, { width: 70, align: 'center' });

            doc.end();
        } catch (error) {
            console.error('Error generating PDF:', error);
            res.status(500).send('Failed to generate PDF');
        }
    }
};
