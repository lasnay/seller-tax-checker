"""Builds the site: python build.py  (pages in _src/, output at repo root)."""
import html, pathlib, re

ROOT = pathlib.Path(__file__).parent
BASE = "https://lasnay.github.io/seller-tax-checker/"
UPDATED_ISO = "2026-11-07"  # default; a page can override with "updated: AAAA-MM-JJ"
MONTHS = "janvier février mars avril mai juin juillet août septembre octobre novembre décembre".split()


def fr_date(iso):
    y, m, d = map(int, iso.split("-"))
    return f"{d} {MONTHS[m - 1]} {y}"

LOGO = '<span class="logo-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>'

NAV = [("declarer-mes-ventes.html", "Dois-je déclarer ?"), ("calcul-marge-revente.html", "Calcul de marge"),
       ("projection-seuil.html", "Projection du seuil"), ("index.html#guides", "Guides")]


def header(current):
    links = "".join(f'<a href="{h}"{" aria-current=page" if h == current else ""}>{n}</a>' for h, n in NAV)
    mobile = "".join(f'<a href="{h}">{n}</a>' for h, n in NAV)
    return f'''<header class="site-header"><div class="wrap bar">
  <a class="logo" href="index.html">{LOGO}Vendeur Clair</a>
  <nav class="hdr-nav" aria-label="Menu principal">{links}</nav>
  <details class="menu"><summary>Menu</summary><nav class="menu-panel" onclick="this.parentNode.open=false">{mobile}</nav></details>
</div></header>'''


FOOTER = '''<footer class="site-footer"><div class="wrap">
  <div class="foot-grid">
    <div><a class="logo" href="index.html">''' + LOGO + '''Vendeur Clair</a><p>Des outils gratuits pour les vendeurs Vinted, Leboncoin, eBay et Etsy. Sans inscription, rien n'est enregistré.</p></div>
    <div><h4>Outils</h4><ul><li><a href="declarer-mes-ventes.html">Dois-je déclarer ?</a></li><li><a href="calcul-marge-revente.html">Calcul de marge</a></li><li><a href="projection-seuil.html">Projection du seuil</a></li></ul></div>
    <div><h4>Guides</h4><ul><li><a href="declarer-ventes-en-ligne.html">Déclarer ses ventes</a></li><li><a href="vinted-impots.html">Impôts Vinted</a></li><li><a href="leboncoin-impots.html">Impôts Leboncoin</a></li><li><a href="impots-ebay.html">Impôts eBay</a></li><li><a href="impots-etsy.html">Impôts Etsy</a></li><li><a href="seuil-30-ventes-2000-euros.html">Seuil de 30 ventes</a></li><li><a href="devenir-micro-entrepreneur-revente.html">Devenir micro-entrepreneur</a></li><li><a href="acre-versement-liberatoire.html">ACRE</a></li></ul></div>
    <div><h4>Sources officielles</h4><ul><li><a href="https://www.impots.gouv.fr/revenus-de-plateformes-collaboratives-0" rel="noopener">impots.gouv.fr</a></li><li><a href="https://www.vinted.fr/dac7" rel="noopener">Vinted – DAC7</a></li><li><a href="https://www.autoentrepreneur.urssaf.fr" rel="noopener">URSSAF</a></li></ul></div>
  </div>
  <p class="foot-legal"><a href="mentions-legales.html">Mentions légales</a> · <a href="confidentialite.html">Confidentialité</a> · Mis à jour le {{UPDATED}}</p>
  <p class="foot-legal" style="border:0;margin-top:8px;padding-top:0">Vendeur Clair donne une information générale et ne remplace pas l'avis d'un professionnel. Les règles fiscales évoluent : vérifie ta situation sur les sites officiels. Site indépendant, sans lien avec Vinted, Leboncoin, eBay ou Etsy.</p>
</div></footer>'''


def page(name, meta, head_extra, body):
    updated = fr_date(meta.get("updated", UPDATED_ISO))
    meta = {k: html.escape(v, quote=True) if k in ("title", "description") else v for k, v in meta.items()}
    canonical = BASE if name == "index.html" else BASE + name
    hero = ""
    if "hero" in meta:
        crumb, title, lead = [x.strip() for x in meta["hero"].split("|")]
        hero = f'''<section class="page-head band"><div class="wrap">
  <p class="crumbs"><a href="index.html">Accueil</a> › {crumb}</p>
  <h1>{title}</h1>
  <p class="lead">{lead}</p>
  <p class="updated">Mis à jour le {updated} · Sources officielles</p>
</div></section>'''
    script = f'\n<script src="common.js"></script>\n<script src="{meta["script"]}"></script>' if "script" in meta else ""
    return f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{meta["title"]}</title>
<meta name="description" content="{meta["description"]}">
<link rel="canonical" href="{canonical}">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="icon" href="favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta name="theme-color" content="#14396a">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="Vendeur Clair">
<meta property="og:title" content="{meta["title"]}">
<meta property="og:description" content="{meta["description"]}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{BASE}og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Vendeur Clair : dois-je déclarer mes ventes Vinted, Leboncoin ?">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="fonts/montserrat.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="style.css">
{head_extra}</head>
<body>
{header(name)}
<main>
{hero}
{body}
</main>
{FOOTER.replace("{{UPDATED}}", updated)}{script}
<script data-goatcounter="https://clearseller.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
</body>
</html>
'''


def build():
    urls = []
    for src in sorted((ROOT / "_src").glob("*.html")):
        text = src.read_text(encoding="utf-8")
        m = re.match(r"<!--\n(.*?)\n-->\n", text, re.S)
        meta = dict(line.split(": ", 1) for line in m.group(1).splitlines())
        rest = text[m.end():]
        head_extra = "".join(re.findall(r'<script type="application/ld\+json">.*?</script>\n', rest, re.S))
        body = re.sub(r'<script type="application/ld\+json">.*?</script>\n', "", rest, flags=re.S)
        (ROOT / src.name).write_text(page(src.name, meta, head_extra, body), encoding="utf-8")
        urls.append((BASE if src.name == "index.html" else BASE + src.name, meta.get("updated", UPDATED_ISO)))
    sitemap = "\n".join(f"  <url><loc>{u}</loc><lastmod>{d}</lastmod></url>" for u, d in urls)
    (ROOT / "sitemap.xml").write_text(
        f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{sitemap}\n</urlset>\n',
        encoding="utf-8")
    print("built", len(urls), "pages")


if __name__ == "__main__":
    build()
