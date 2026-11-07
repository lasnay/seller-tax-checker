const PLATFORMS = ["Vinted", "Leboncoin", "eBay", "Etsy", "Autre plateforme"];

const platformsEl = document.getElementById("platforms");
const resultEl = document.getElementById("result");
const resaleFields = document.getElementById("resaleFields");
const purchasesEl = document.getElementById("purchases");

platformsEl.innerHTML = PLATFORMS.map((name, i) =>
  `<div class="plat" data-i="${i}">
    <div class="plat-head"><span class="plat-name">${name}</span><span class="tag">Seuil atteint</span></div>
    <div class="inputs">
      <label>Ventes<input type="number" min="0" step="1" value="0" inputmode="numeric" data-k="count" aria-label="${name} : nombre de ventes"></label>
      <label>Total encaissé (€)<input type="number" min="0" step="1" value="0" inputmode="decimal" data-k="amount" aria-label="${name} : total encaissé"></label>
    </div>
    <div class="meters">
      <div><div class="meter" data-m="count"><i></i></div><div class="meter-l" data-l="count"></div></div>
      <div><div class="meter" data-m="amount"><i></i></div><div class="meter-l" data-l="amount"></div></div>
    </div>
  </div>`).join("");

const eur = n => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const num = el => Math.max(0, parseFloat(el.value) || 0);

function setMeter(row, key, value, limit, hit, label) {
  const meter = row.querySelector(`[data-m="${key}"]`);
  meter.classList.toggle("hit", hit);
  meter.firstElementChild.style.width = Math.min(100, (value / limit) * 100) + "%";
  row.querySelector(`[data-l="${key}"]`).textContent = label;
}

function compute() {
  const rows = [...platformsEl.querySelectorAll(".plat")];
  let totalSales = 0, totalAmount = 0;
  const flagged = [];
  rows.forEach((row, i) => {
    const count = num(row.querySelector('[data-k="count"]'));
    const amount = num(row.querySelector('[data-k="amount"]'));
    totalSales += count;
    totalAmount += amount;
    const countHit = count >= SALES_THRESHOLD;
    const amountHit = amount > AMOUNT_THRESHOLD;
    setMeter(row, "count", count, SALES_THRESHOLD, countHit, `${count} / ${SALES_THRESHOLD} ventes`);
    setMeter(row, "amount", amount, AMOUNT_THRESHOLD, amountHit, `${eur(amount)} / ${eur(AMOUNT_THRESHOLD)}`);
    row.classList.toggle("hit", countHit || amountHit);
    if (countHit || amountHit) flagged.push(PLATFORMS[i]);
  });
  const profile = document.querySelector('input[name="profile"]:checked').value;
  resaleFields.hidden = profile !== "resale";
  render({ totalSales, totalAmount, flagged, profile, purchases: num(purchasesEl) });
}

function render({ totalSales, totalAmount, flagged, profile, purchases }) {
  if (totalSales === 0 && totalAmount === 0) {
    resultEl.innerHTML = '<p class="empty">Entre tes ventes pour voir ton résultat.</p>';
    return;
  }
  let html = "";

  if (flagged.length) {
    const many = flagged.length > 1;
    html += verdict("warn", "!", `${flagged.join(" et ")} ${many ? "vont" : "va"} transmettre tes ventes au fisc`,
      `<p>Tu atteins ${SALES_THRESHOLD} ventes ou dépasses ${eur(AMOUNT_THRESHOLD)} sur ${many ? "ces plateformes" : "cette plateforme"}. C'est une information envoyée à l'administration, pas un impôt.</p>`);
  } else {
    html += verdict("ok", "✓", "Aucune plateforme ne transmettra tes ventes au fisc",
      `<p>Tu restes sous ${SALES_THRESHOLD} ventes et ${eur(AMOUNT_THRESHOLD)} sur chacune.</p>`);
  }

  if (profile === "perso") {
    html += verdict("ok", "✓", "Tu vends tes affaires personnelles d'occasion",
      `<p>Ces ventes ne sont pas imposables et, si elles restent occasionnelles, n'entraînent pas de cotisations sociales, même si la plateforme te déclare. Les sommes peuvent apparaître pré-remplies dans ta déclaration en ligne sans être imposables.</p>
       <p>Exceptions : métaux précieux, bijoux, œuvres d'art, objets de collection ou d'antiquité vendus plus de 5 000 € relèvent d'un autre régime.</p>`);
  } else {
    const contributions = totalAmount * MICRO_SALES_RATE;
    const left = totalAmount - purchases - contributions;
    html += verdict("bad", "i", "Acheter pour revendre est une activité commerciale",
      `<p>Dès que c'est régulier, il faut en principe un statut (le plus simple : micro-entrepreneur) et déclarer ce chiffre d'affaires.</p>`);
    html += `<div class="stats">
      <div class="stat"><b>${eur(totalAmount)}</b><span>Chiffre d'affaires</span></div>
      <div class="stat"><b>${eur(contributions)}</b><span>Cotisations estimées (${(MICRO_SALES_RATE * 100).toFixed(1).replace(".", ",")} % du CA)</span></div>
      <div class="stat"><b>${eur(left)}</b><span>Il te reste, avant impôt sur le revenu</span></div>
    </div>
    <p class="note">Estimation indicative, taux 2026 de la vente de marchandises en micro-entreprise (hors ACRE de début d'activité, plus basse, et hors 1 % en plus avec le versement libératoire). Vérifie sur autoentrepreneur.urssaf.fr.</p>`;
  }
  resultEl.innerHTML = html;
}

document.addEventListener("input", compute);
document.addEventListener("change", compute);
compute();
