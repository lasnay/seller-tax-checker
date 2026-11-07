const PLATFORMS = ["Vinted", "Leboncoin", "eBay", "Etsy", "Autre plateforme"];
const SALES_THRESHOLD = 30;
const AMOUNT_THRESHOLD = 2000;
const MICRO_SALES_RATE = 0.123;

const platformsEl = document.getElementById("platforms");
const resultEl = document.getElementById("result");
const resaleFields = document.getElementById("resaleFields");
const purchasesEl = document.getElementById("purchases");

platformsEl.innerHTML =
  '<div class="row head"><span>Plateforme</span><span>Nombre de ventes</span><span>Total encaissé (€)</span></div>' +
  PLATFORMS.map((name, i) =>
    `<div class="row" data-i="${i}">
      <span class="name">${name}</span>
      <input type="number" min="0" step="1" value="0" inputmode="numeric" data-k="count" aria-label="${name} : nombre de ventes">
      <input type="number" min="0" step="1" value="0" inputmode="decimal" data-k="amount" aria-label="${name} : total encaissé">
      <span class="badge" id="badge${i}">Seuil atteint : ${name} transmettra tes ventes au fisc.</span>
    </div>`).join("");

const eur = n => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const num = el => Math.max(0, parseFloat(el.value) || 0);

function compute() {
  const rows = [...platformsEl.querySelectorAll(".row[data-i]")];
  let totalSales = 0, totalAmount = 0;
  const flagged = [];
  rows.forEach((row, i) => {
    const count = num(row.querySelector('[data-k="count"]'));
    const amount = num(row.querySelector('[data-k="amount"]'));
    totalSales += count;
    totalAmount += amount;
    const hit = count >= SALES_THRESHOLD || amount > AMOUNT_THRESHOLD;
    document.getElementById("badge" + i).classList.toggle("on", hit);
    if (hit) flagged.push(PLATFORMS[i]);
  });
  const profile = document.querySelector('input[name="profile"]:checked').value;
  resaleFields.hidden = profile !== "resale";
  render({ totalSales, totalAmount, flagged, profile, purchases: num(purchasesEl) });
}

function render({ totalSales, totalAmount, flagged, profile, purchases }) {
  let html = "<h2>Ton résultat</h2>";
  if (totalSales === 0 && totalAmount === 0) {
    resultEl.innerHTML = html + "<p>Entre tes ventes ci-dessus pour voir le résultat.</p>";
    return;
  }

  if (flagged.length) {
    html += `<div class="verdict warn"><p><strong>${flagged.join(", ")} va transmettre tes ventes au fisc.</strong></p>
      <p>Tu dépasses ${SALES_THRESHOLD} ventes ou ${eur(AMOUNT_THRESHOLD)} sur cette plateforme. C'est une information envoyée à l'administration, pas un impôt.</p></div>`;
  } else {
    html += `<div class="verdict"><p><strong>Aucune plateforme ne transmettra tes ventes au fisc.</strong></p>
      <p>Tu restes sous ${SALES_THRESHOLD} ventes et ${eur(AMOUNT_THRESHOLD)} sur chacune.</p></div>`;
  }

  if (profile === "perso") {
    html += `<div class="verdict"><p><strong>Tu vends tes affaires personnelles d'occasion.</strong></p>
      <p>En principe, ces ventes ne sont pas imposables, même si la plateforme te déclare. Garde tout de même de quoi prouver que ce sont tes affaires (photos, anciens tickets).</p></div>`;
  } else {
    const contributions = totalAmount * MICRO_SALES_RATE;
    const margin = totalAmount - purchases;
    const left = margin - contributions;
    html += `<div class="verdict bad"><p><strong>Acheter pour revendre est une activité commerciale.</strong></p>
      <p>Dès que c'est régulier, il faut en principe un statut (le plus simple : micro-entrepreneur) et déclarer ce chiffre d'affaires.</p></div>
      <div class="stats">
        <div class="stat"><b>${eur(totalAmount)}</b><span>Chiffre d'affaires</span></div>
        <div class="stat"><b>${eur(contributions)}</b><span>Cotisations estimées (${(MICRO_SALES_RATE * 100).toFixed(1).replace(".", ",")} % du CA)</span></div>
        <div class="stat"><b>${eur(left)}</b><span>Il te reste après achats et cotisations, avant impôt sur le revenu</span></div>
      </div>
      <p class="hint">Estimation indicative. Le taux est celui de la vente de marchandises en micro-entreprise : vérifie-le sur autoentrepreneur.urssaf.fr.</p>`;
  }
  resultEl.innerHTML = html;
}

document.addEventListener("input", compute);
document.addEventListener("change", compute);
compute();
