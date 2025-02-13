module.exports = function getDynamicTableHtml({ columns, data }) {
  let html = `
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
            ${document[column.key] || document[column.key] === 0 ? document[column.key] : "-"}
          </td>
        `;
      }
      return html;
    }

    return html;
  }
  
  return html;
};
