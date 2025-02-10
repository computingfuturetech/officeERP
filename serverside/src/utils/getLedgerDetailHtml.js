module.exports = function getLedgerDetailHtml(data) {
  let html = "";
  Object.keys(data).forEach((key) => {
    if (data[key]) {
      let value = data[key];
      html += `
        <div> ${key} </div>
        <div> ${value} </div>
      `;
    }
  });
  return html;
};
