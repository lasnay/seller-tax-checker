"""Builds the site: python build.py  (pages in _src/, output at repo root)."""
import pathlib, re

ROOT = pathlib.Path(__file__).parent
BASE = "https://lasnay.github.io/seller-tax-checker/"

LOGO = '<span class="logo-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>'

NAV = [("declarer-mes-ventes.html", "Dois-je déclarer ?"), ("calcul-marge-revente.html", "Calcul de marge"),
       ("projection-seuil.html", "Projection du seuil"), ("index.html#guides", "Guides")]


def header(current):
    links = "".join(f'<a href="{h}"{" aria-current=page" if h == current else ""}>{n}</a>' for h, n in NAV)
    mobile = "".join(f'<a href="{h}">{n}</a>' for h, n in NAV)
    return f'''<header class="site-header"><div class="wrap bar">
  <a class="logo" href="index.html">{LOGO}Vendeur Clair</a>
  <nav class="hdr-nav" aria-label="Menu principal">{links}</nav>
  <details class="menu"><summary>Menu</summary><nav class="menu-panel">{mobile}</nav></details>
</div></header>'''


FOOTER = '''<footer class="site-footer"><div class="wrap">
  <div class="foot-grid">
    <div><a class="logo" href="index.html">''' + LOGO + '''Vendeur Clair</a><p>Des outils gratuits pour les vendeurs Vinted, Leboncoin, eBay et Etsy. Sans inscription, rien n'est enregistré.</p></div>
    <div><h4>Outils</h4><ul><li><a href="declarer-mes-ventes.html">Dois-je déclarer ?</a></li><li><a href="calcul-marge-revente.html">Calcul de marge</a></li><li><a href="projection-seuil.html">Projection du seuil</a></li></ul></div>
    <div><h4>Guides</h4><ul><li><a href="vinted-impots.html">Impôts Vinted</a></li><li><a href="leboncoin-impots.html">Impôts Leboncoin</a></li><li><a href="seuil-30-ventes-2000-euros.html">Seuil de 30 ventes</a></li></ul></div>
    <div><h4>Sources officielles</h4><ul><li><a href="https://www.impots.gouv.fr/revenus-de-plateformes-collaboratives-0" rel="noopener">impots.gouv.fr</a></li><li><a href="https://www.vinted.fr/dac7" rel="noopener">Vinted – DAC7</a></li><li><a href="https://www.autoentrepreneur.urssaf.fr" rel="noopener">URSSAF</a></li></ul></div>
  </div>
  <p class="foot-legal">Vendeur Clair donne une information générale et ne remplace pas l'avis d'un professionnel. Les règles fiscales évoluent : vérifie ta situation sur les sites officiels. Site indépendant, sans lien avec Vinted, Leboncoin, eBay ou Etsy.</p>
</div></footer>'''


def page(name, meta, head_extra, body):
    canonical = BASE if name == "index.html" else BASE + name
    hero = ""
    if "hero" in meta:
        crumb, title, lead = [x.strip() for x in meta["hero"].split("|")]
        hero = f'''<section class="page-head band"><div class="wrap">
  <p class="crumbs"><a href="index.html">Accueil</a> › {crumb}</p>
  <h1>{title}</h1>
  <p class="lead">{lead}</p>
</div></section>'''
    script = f'\n<script src="{meta["script"]}"></script>' if "script" in meta else ""
    return f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{meta["title"]}</title>
<meta name="description" content="{meta["description"]}">
<link rel="canonical" href="{canonical}">
<link rel="preload" href="fonts/montserrat.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="style.css">
{head_extra}</head>
<body>
{header(name)}
<main>
{hero}
{body}
</main>
{FOOTER}{script}
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
        urls.append(BASE if src.name == "index.html" else BASE + src.name)
    sitemap = "\n".join(f"  <url><loc>{u}</loc></url>" for u in urls)
    (ROOT / "sitemap.xml").write_text(
        f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{sitemap}\n</urlset>\n',
        encoding="utf-8")
    print("built", len(urls), "pages")


if __name__ == "__main__":
    build()
