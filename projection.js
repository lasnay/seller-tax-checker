const SALES_THRESHOLD = 30;
const AMOUNT_THRESHOLD = 2000;
const DAY = 86400000;

const $ = id => document.getElementById(id);
const num = id => Math.max(0, parseFloat($(id).value) || 0);
const eur = n => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const longDate = d => d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

const today = new Date();
$("date").value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

function verdict(kind, icon, title, body) {
  return `<div class="verdict ${kind}"><div class="ico">${icon}</div><div><h3>${title}</h3><p>${body}</p></div></div>`;
}

function compute() {
  const count = num("count"), amount = num("amount");
  const [y, m, d] = ($("date").value || "").split("-").map(Number);
  if (!y) { $("result").innerHTML = '<p class="empty">Choisis une date.</p>'; return; }
  const date = new Date(y, m - 1, d);
  const start = new Date(y, 0, 1);
  const daysInYear = Math.round((new Date(y + 1, 0, 1) - start) / DAY);
  const dayIndex = Math.round((date - start) / DAY) + 1;
  const daysLeft = daysInYear - dayIndex;

  if (count === 0 && amount === 0) {
    $("result").innerHTML = '<p class="empty">Entre tes ventes depuis le 1er janvier pour voir ta projection.</p>';
    return;
  }

  const projCount = Math.round(count * daysInYear / dayIndex);
  const projAmount = amount * daysInYear / dayIndex;
  const reached = count >= SALES_THRESHOLD || amount > AMOUNT_THRESHOLD;
  let html = "";

  if (reached) {
    html += verdict("warn", "!", "Tu as déjà atteint le seuil cette année",
      "La plateforme transmettra tes ventes au fisc. Ce n'est pas un impôt : vérifie avec le simulateur si tu dois payer quelque chose.");
  } else {
    const crossings = [];
    if (count > 0) crossings.push(Math.ceil(SALES_THRESHOLD * dayIndex / count));
    if (amount > 0) crossings.push(Math.floor(AMOUNT_THRESHOLD * dayIndex / amount) + 1);
    const crossDay = Math.min(...crossings);
    if (crossDay <= daysInYear) {
      const crossDate = new Date(y, 0, crossDay);
      html += verdict("warn", "!", `À ce rythme, tu passerais le seuil vers le ${longDate(crossDate)}`,
        "La plateforme transmettrait alors tes ventes au fisc. Ce n'est pas un impôt en soi.");
    } else {
      html += verdict("ok", "✓", "À ce rythme, tu resteras sous le seuil",
        `Tu finirais l'année autour de ${projCount} ventes et ${eur(projAmount)}.`);
    }
  }

  html += `<div class="stats">
    <div class="stat big"><b>${projCount}</b><span>ventes estimées au 31 décembre</span></div>
    <div class="stat"><b>${eur(projAmount)}</b><span>encaissés estimés au 31 décembre</span></div>
    <div class="stat"><b>${Math.max(0, SALES_THRESHOLD - 1 - count)}</b><span>ventes possibles d'ici la fin d'année sans atteindre 30</span></div>
  </div>`;

  if (!reached && daysLeft > 0) {
    const months = daysLeft / (daysInYear / 12);
    const perMonth = (SALES_THRESHOLD - 1 - count) / months;
    html += `<p class="note">Pour rester sous le seuil, il te reste ${SALES_THRESHOLD - 1 - count} ventes et ${eur(AMOUNT_THRESHOLD - amount)} jusqu'au 31 décembre, soit environ ${perMonth.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} ventes par mois.</p>`;
  }
  html += `<p class="note">Projection au rythme moyen depuis le 1er janvier : les ventes de fin d'année (Noël, soldes) peuvent la faire bouger. Le seuil se compte plateforme par plateforme.</p>`;
  $("result").innerHTML = html;
}

document.addEventListener("input", compute);
document.addEventListener("change", compute);
compute();
