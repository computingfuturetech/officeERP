const fs = require("fs");
const path = require("path");

const ledgerTemplatePath = path.join(
  __dirname,
  "../../storage/templates/ledgerTemplate.html"
);
const incomeStatementTemplatePath = path.join(
  __dirname,
  "../../storage/templates/incomeStatementTemplate.html"
);
const balanceSheetTemplatePath = path.join(
  __dirname,
  "../../storage/templates/balanceSheetTemplate.html"
);
const ledgerTemplateHtml = fs.readFileSync(ledgerTemplatePath, "utf-8");
const incomeStatementHtml = fs.readFileSync(
  incomeStatementTemplatePath,
  "utf-8"
);
const balanceSheetHtml = fs.readFileSync(balanceSheetTemplatePath, "utf-8");

function getDynamicGridHtml(data) {
  let html = `
    <div style="display: grid; grid-template-columns: repeat(4, 1fr);">
      ${getGridContent()}
    </div>
  `;

  function getGridContent() {
    let html = ``;
    Object.keys(data).forEach((key) => {
      if (data[key] || data[key] === 0) {
        let value = data[key];
        html += `
          <div style="border: 1px solid #d1d1d1; padding: 3px; font-weight: bold"> ${key} </div>
          <div style="border: 1px solid #d1d1d1; padding: 3px;"> ${value} </div>
        `;
      }
    });
    return html;
  }
  return html;
}

function getDynamicTableHtml({ heading, columns, data }) {
  let html = `
    <div>
      ${
        heading
          ? `
        <h3>
          ${heading}
        </h3>
        `
          : ""
      }
      <table style="table-layout: fixed; width: 100%; border-collapse: collapse; font-size: 13px">
        <thead style="background-color: #f3f1f1;"> 
          <tr>
            ${getTableHeaderCells()}
          </tr>
        </thead>
        <tbody>
          ${getTableBodyRows()}
        </tbody>
      </table>
    </div>
  `;

  function getTableHeaderCells() {
    let html = ``;
    for (const column of columns) {
      html += `<th style="border: 1px solid #d1d1d1; text-align: center; padding: 7px; word-wrap: break-word; white-space: ${
        column.inSingleLine === true ? "nowrap;" : "unset;"
      }">${column.label}</th>`;
    }
    return html;
  }

  function getTableBodyRows() {
    let html = ``;
    for (const document of data) {
      html += `
        <tr>
          ${getTableBodyRowCells(document)}
        </tr>
      `;
    }

    function getTableBodyRowCells(document) {
      let html = ``;
      for (const column of columns) {
        html += `
          <td style="border: 1px solid #d1d1d1; text-align: center; padding: 7px; word-wrap: break-word; white-space: ${
            column.inSingleLine === true ? "nowrap;" : "unset;"
          }">
            ${
              document[column.key] || document[column.key] === 0
                ? document[column.key]
                : ""
            }
          </td>
        `;
      }
      return html;
    }

    return html;
  }

  return html;
}

function generateLedgerHtml(
  pageTitle,
  ledgerHeadingHtml,
  ledgerDetailHtml,
  ledgerTableHtml
) {
  let ledgerTemplateHtmlCopy = ledgerTemplateHtml;

  ledgerTemplateHtmlCopy = ledgerTemplateHtmlCopy.replace(
    "{{pageTitle}}",
    pageTitle
  );

  ledgerTemplateHtmlCopy = ledgerTemplateHtmlCopy.replace(
    "{{ledgerHeading}}",
    ledgerHeadingHtml
  );

  ledgerTemplateHtmlCopy = ledgerTemplateHtmlCopy.replace(
    "{{ledgerDetail}}",
    ledgerDetailHtml
  );

  ledgerTemplateHtmlCopy = ledgerTemplateHtmlCopy.replace(
    "{{ledgerTable}}",
    ledgerTableHtml
  );

  return ledgerTemplateHtmlCopy;
}

function generateIncomeStatementHtml(
  incomeStatementHeadingHtml,
  incomeStatementDetailHtml,
  incomeStatementTablesHtml
) {
  let incomeStatementHtmlCopy = incomeStatementHtml;

  incomeStatementHtmlCopy = incomeStatementHtmlCopy.replace(
    "{{incomeStatementHeading}}",
    incomeStatementHeadingHtml
  );

  incomeStatementHtmlCopy = incomeStatementHtmlCopy.replace(
    "{{incomeStatementDetail}}",
    incomeStatementDetailHtml
  );

  incomeStatementHtmlCopy = incomeStatementHtmlCopy.replace(
    "{{incomeStatementTables}}",
    incomeStatementTablesHtml
  );

  return incomeStatementHtmlCopy;
}

function generateBalanceSheetHtml(
  balanceSheetHeadingHtml,
  balanceSheetDetailHtml,
  balanceSheetTablesHtml
) {
  let balanceSheetHtmlCopy = balanceSheetHtml;

  balanceSheetHtmlCopy = balanceSheetHtmlCopy.replace(
    "{{balanceSheetHeading}}",
    balanceSheetHeadingHtml
  );

  balanceSheetHtmlCopy = balanceSheetHtmlCopy.replace(
    "{{balanceSheetDetail}}",
    balanceSheetDetailHtml
  );

  balanceSheetHtmlCopy = balanceSheetHtmlCopy.replace(
    "{{balanceSheetTables}}",
    balanceSheetTablesHtml
  );

  return balanceSheetHtmlCopy;
}

module.exports = {
  generateLedgerHtml,
  getDynamicGridHtml,
  getDynamicTableHtml,
  generateIncomeStatementHtml,
  generateBalanceSheetHtml,
};
