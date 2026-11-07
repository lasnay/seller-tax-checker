const SALES_THRESHOLD = 30;
const AMOUNT_THRESHOLD = 2000;
const MICRO_SALES_RATE = 0.123;
const VL_RATE = 0.01;

function verdict(kind, icon, title, bodyHtml) {
  return `<div class="verdict ${kind}"><div class="ico">${icon}</div><div><h3>${title}</h3>${bodyHtml}</div></div>`;
}
