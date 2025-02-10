module.exports = function getLedgerTableHtml({ columns, data }) {
  let html = `
    <table>
      <thead> 
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
      html += `<th style="white-space: ${
        column.inSingleLine === true ? "nowrap" : "unset"
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
          <td style="white-space: ${
            column.inSingleLine === true ? "nowrap" : "unset"
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
