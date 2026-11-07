const $ = id => document.getElementById(id);
const num = id => Math.max(0, parseFloat($(id).value) || 0);
const eur = n => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = n => (n * 100).toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " %";

function priceFor(profit, costs, variableRate) {
  const share = 1 - variableRate;
  return share > 0 ? (profit + costs) / share : null;
}

function compute() {
  const micro = document.querySelector('input[name="status"]:checked').value === "micro";
  $("vlWrap").hidden = !micro;
  const buy = num("buy"), sell = num("sell"), ship = num("ship"), extra = num("extra");
  const feeRate = Math.min(num("fee"), 100) / 100, target = num("target");
  const taxRate = micro ? MICRO_SALES_RATE + ($("vl").checked ? VL_RATE : 0) : 0;

  const feeAmount = sell * feeRate;
  const contributions = sell * taxRate;
  const costs = buy + ship + extra;
  const net = sell - costs - feeAmount - contributions;
  const breakEven = priceFor(0, costs, feeRate + taxRate);
  const targetPrice = priceFor(target, costs, feeRate + taxRate);

  let html = "";
  if (sell === 0) {
    $("result").innerHTML = '<p class="empty">Entre un prix de vente pour voir ton résultat.</p>';
    return;
  }
  if (net < 0) {
    html += verdict("bad", "!", `Tu perds ${eur(-net)} sur cette vente`,
      `<p>${breakEven ? `Il faut vendre au moins ${eur(breakEven)} pour ne rien perdre.` : "Les frais dépassent le prix de vente."}</p>`);
  } else if (net < target) {
    html += verdict("warn", "!", `Tu gagnes ${eur(net)}, sous ton objectif`,
      targetPrice ? `<p>Affiche au moins ${eur(targetPrice)} pour gagner ${eur(target)}.</p>` : "");
  } else {
    html += verdict("ok", "✓", `Objectif atteint : tu gagnes ${eur(net)}`,
      targetPrice ? `<p>Tu pourrais descendre jusqu'à ${eur(targetPrice)} et garder ${eur(target)} de bénéfice.</p>` : "");
  }

  html += `<div class="stats">
    <div class="stat big"><b>${eur(net)}</b><span>Bénéfice net</span></div>
    <div class="stat"><b>${pct(net / sell)}</b><span>Marge sur le prix de vente</span></div>
    <div class="stat"><b>${buy > 0 ? pct(net / buy) : "—"}</b><span>Rendement sur ton achat</span></div>
  </div>
  <p class="note">Détail : ${eur(sell)} de vente − ${eur(buy)} d'achat − ${eur(ship)} d'envoi − ${eur(extra)} de frais − ${eur(feeAmount)} de commission${micro ? ` − ${eur(contributions)} de cotisations${$("vl").checked ? " et d'impôt" : ""}` : ""}.</p>`;

  html += micro
    ? `<p class="note">Cotisations : taux 2026 de la vente de marchandises en micro-entreprise, sur le prix de vente (et non sur le bénéfice). Hors ACRE de début d'activité, plus basse. Sans versement libératoire, l'impôt sur le revenu reste à payer à part.</p>`
    : `<p class="note">Vendre tes affaires d'occasion n'entraîne pas de cotisations. Si tu achètes régulièrement pour revendre, c'est une activité commerciale : choisis « Micro-entrepreneur ».</p>`;
  $("result").innerHTML = html;
}

document.addEventListener("input", compute);
document.addEventListener("change", compute);
compute();
