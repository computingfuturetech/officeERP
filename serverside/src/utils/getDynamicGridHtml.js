module.exports = function getDynamicGridHtml(data) {
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
};
