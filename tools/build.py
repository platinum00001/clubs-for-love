#!/usr/bin/env python3
"""Builds the static HTML pages for Clubs for Love from one shared header/footer.
Run:  python3 tools/build.py   (writes *.html in the site root). Edit page bodies below."""
import os, html
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://clubsforlove.com/"
DESC = "Used or new, golf clubs on Cape Cod become a first bag for someone in recovery."
V = "1"  # bump to bust caches for css/js

ICON = {
 "pin": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
 "clock": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
 "user": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
 "car": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 17h14M6 17v2M18 17v2M4 13l2-6h12l2 6v4H4z"/><circle cx="8" cy="14" r="1"/><circle cx="16" cy="14" r="1"/></svg>',
 "camera": '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
 "truck": '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 6h11v10H2zM13 10h5l3 3v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
 "hands": '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 17l-2 2a2 2 0 0 1-3-3l4-4 3-1 5 5-3 3a2 2 0 0 1-3 0zM3 11l4-4 4 1M21 11l-4-4-5 2"/></svg>',
 "flag": '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
}
MARK = '<svg viewBox="0 0 32 32" aria-hidden="true"><ellipse cx="16" cy="27" rx="7" ry="2" fill="#C4A574"/><rect x="15" y="5" width="2" height="22" rx="1" fill="#F4EFE4"/><path fill="#F4EFE4" d="M17 5.2h10L17 13.8z"/></svg>'

SITES = [  # "Our Sites" cross-links (same list as healthandwellnessmaps.com)
 ("Health &amp; Wellness Maps", "Local health and wellness resources on one searchable map, starting on Cape Cod.", "https://healthandwellnessmaps.com/"),
 ("Root to Rise", "Recovery community support with coaching, meals and work in Falmouth and Mashpee, MA and Nashua, NH.", "https://roottorisema.org/"),
 ("Cape Island Caf&eacute;", "Soups, salads, bowls and wraps for lunch at 316 Gifford Street in Falmouth, MA.", "https://capeislandcafe.com/"),
 ("Chef Bookings", "Find and book a private chef for dinners, celebrations, or weekly meals at home.", "https://chefbookings.org/"),
 ("Cape Edge", "Pre-filled peptide pens and peptide education for licensed clinicians and practices.", "https://platinum00001.github.io/cape-edge/"),
 ("Tanorama Falmouth", "Tanning, spray tans, red light therapy, massage and facials at 365 Main St, Falmouth, MA.", "https://platinum00001.github.io/tanarama-falmouth/"),
 ("Recovery Milestones", "Celebrate sobriety anniversaries with rewards from local businesses.", "https://platinum00001.github.io/recovery-milestones/"),
]

NAV = [("drop-off.html", "Drop-off"), ("request.html", "Need clubs"), ("pickup.html", "Pickup"), ("about.html", "About")]
MENU = [("donate.html", "Donate gear"), ("drop-off.html", "Drop-off"), ("request.html", "Need clubs"), ("pickup.html", "Pickup"),
        ("affiliates.html", "Affiliates"), ("sponsors.html", "Give a round"), ("stories.html", "Stories"), ("calendar.html", "Calendar"),
        ("about.html", "About"), ("contact.html", "Contact"), ("account.html", "Sign in")]

def head(title, desc, page, noindex=False, base=""):
    full = "Clubs for Love" if title == "Clubs for Love" else title + " · Clubs for Love"
    url = SITE + ("" if page == "index.html" else page)
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
{base}<title>{full}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#1B4D3E">
{'<meta name="robots" content="noindex">' if noindex else f'<link rel="canonical" href="{url}">'}
<meta property="og:type" content="website">
<meta property="og:site_name" content="Clubs for Love">
<meta property="og:title" content="{full}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Two golf bags on a Cape Cod porch with the words Clubs for Love">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{full}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{SITE}og.jpg">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="icon" href="favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&amp;family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400&amp;display=swap">
<link rel="stylesheet" href="css/styles.css?v={V}">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="topbar"><div class="wrap"><a data-email href="#">clubs4lovema@gmail.com</a><span>Falmouth · Mashpee · Upper Cape</span></div></div>
<header class="site">
 <div class="wrap navbar">
  <a class="brand" href="index.html"><span class="mark">{MARK}</span><span><b>Clubs for Love</b><small>Cape Cod</small></span></a>
  <nav class="navlinks" aria-label="Main">
   {"".join(f'<a class="hide-sm" href="{h}"{" aria-current=page" if h == page else ""}>{t}</a>' for h, t in NAV)}
   <a class="btn sm" href="donate.html">Donate</a>
   <button class="menu-btn" aria-expanded="false" aria-controls="site-menu" aria-label="Menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
  </nav>
 </div>
 <div class="menu" id="site-menu"><div class="wrap">{"".join(f'<a href="{h}"{" data-account-link" if h == "account.html" else ""}>{t}</a>' for h, t in MENU)}</div></div>
</header>
<main id="main">
'''

def footer(scripts=()):
    sites = "".join(f'<a href="{u}" target="_blank" rel="noopener"><b>{n}</b><small>{d}</small></a>' for n, d, u in SITES)
    js = "".join(f'<script src="js/{s}.js?v={V}"></script>' for s in scripts)
    return f'''</main>
<footer class="site">
 <div class="wrap foot-grid">
  <div class="foot-brand">
   <a class="brand" href="index.html" style="color:inherit"><span class="mark">{MARK}</span><span><b>Clubs for Love</b><small style="color:var(--sand)">Cape Cod</small></span></a>
   <p style="margin-top:14px">Used or new clubs, shoes, and apparel go to people in recovery on Cape Cod. Courses, shops, and simulators can donate a round. Anyone can sponsor one. Extra sets may be auctioned for green fees, lessons, and recovery golf days.</p>
   <p class="eyebrow" style="margin-top:18px">Follow</p>
   <div class="social" data-social></div>
  </div>
  <div>
   <p class="eyebrow">Drop-off</p>
   <p><strong style="color:var(--cream)">Falmouth</strong><br>316 Gifford Street<br>Falmouth, MA 02540</p>
   <p><strong style="color:var(--cream)">Mashpee</strong><br>439 Route 151 (Nathan Ellis Highway), Unit 6<br>Mashpee, MA 02649</p>
  </div>
  <div>
   <p class="eyebrow">Write us</p>
   <p><a class="foot-email" data-email href="#">clubs4lovema@gmail.com</a></p>
   <p>The only inbox on this site. Written gift acknowledgment is emailed after we actually receive the gear. We do not appraise.</p>
   <div class="foot-links"><a href="donate.html">Donate</a><a href="drop-off.html">Drop-off</a><a href="request.html">Need clubs</a><a href="pickup.html">Pickup</a><a href="affiliates.html">Affiliates</a><a href="sponsors.html">Give a round</a><a href="stories.html">Stories</a><a href="calendar.html">Calendar</a><a href="about.html">About</a><a href="contact.html">Contact</a><a href="account.html" data-account-link>Sign in</a></div>
  </div>
 </div>
 <div class="wrap our-sites" id="our-sites">
  <p class="eyebrow">Our Sites</p>
  <h2>Sister projects serving Cape Cod and beyond.</h2>
  <div class="sites">{sites}</div>
 </div>
 <div class="foot-bottom"><div class="wrap">
  <span>If you or someone you love is in crisis, call or text <a href="tel:988">988</a>. In an emergency, dial 911.</span>
  <span>&copy; <span data-year>2026</span> Clubs for Love · A Root to Rise program. Cape Cod. · <a href="privacy.html">Privacy</a> · <a href="terms.html">Terms</a></span>
 </div></div>
</footer>
<script src="config.js?v={V}"></script>
<script src="js/supabase-client.js?v={V}"></script>
<script src="js/common.js?v={V}"></script>
{js}
</body>
</html>
'''

def site_card(which):
    if which == "falmouth":
        return f'''<div class="card site-card">
 <iframe title="Map of the Falmouth drop-off" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=-70.6325%2C41.5536%2C-70.5965%2C41.5896&amp;layer=mapnik&amp;marker=41.5716%2C-70.6145"></iframe>
 <div class="body"><p class="eyebrow">Falmouth</p><h3>Falmouth drop-off</h3><ul>
  <li>{ICON["pin"]}<span>316 Gifford Street<br>Falmouth, MA 02540</span></li>
  <li>{ICON["clock"]}<span>Hours to be posted. Drop-offs by arrangement.</span></li>
  <li>{ICON["user"]}<span>Ask for Clubs for Love.</span></li>
  <li>{ICON["car"]}<span>Ample lot parking. Pull in and text on arrival so we can meet you at the door.</span></li></ul>
 <a class="btn sand" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&amp;destination=316%20Gifford%20Street%2C%20Falmouth%2C%20MA%2002540">Directions</a></div></div>'''
    return f'''<div class="card site-card">
 <iframe title="Map of the Mashpee drop-off" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=-70.5084%2C41.5905%2C-70.4724%2C41.6265&amp;layer=mapnik&amp;marker=41.6085%2C-70.4904"></iframe>
 <div class="body"><p class="eyebrow">Mashpee</p><h3>Family Kung Fu &amp; Wellness</h3><p class="hint" style="margin:0">Kung Fu Family Wellness</p><ul>
  <li>{ICON["pin"]}<span>439 Route 151 (Nathan Ellis Highway), Unit 6<br>Mashpee, MA 02649</span></li>
  <li>{ICON["clock"]}<span>During class hours, or by arrangement.</span></li>
  <li>{ICON["user"]}<span>Front desk — ask for the Clubs for Love barrel.</span></li>
  <li>{ICON["car"]}<span>Plaza lot. Park and text on arrival.</span></li></ul>
 <a class="btn sand" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&amp;destination=439%20Route%20151%20Unit%206%2C%20Mashpee%2C%20MA%2002649">Directions</a></div></div>'''

HP = '<div class="hp" aria-hidden="true"><label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>'
def you(mailing=True):
    return f'''<fieldset><legend>You</legend>
 <div class="field"><label for="f-name">Name *</label><input id="f-name" name="name" type="text" autocomplete="name" required maxlength="120"></div>
 <div class="field"><label for="f-email">Email *</label><input id="f-email" name="email" type="email" autocomplete="email" required maxlength="200"></div>
 <div class="field"><label for="f-phone">Phone <span class="opt">optional</span></label><input id="f-phone" name="phone" type="tel" autocomplete="tel" maxlength="30"></div>
 {'<div class="field"><label for="f-addr">Mailing address <span class="opt">optional</span></label><textarea id="f-addr" name="mailing_address" autocomplete="street-address" maxlength="400"></textarea><p class="hint">Only if you want a written receipt by mail. We still email the gift acknowledgment.</p></div>' if mailing else ''}
</fieldset>'''
def goes_to(extra=""):
    return f'<p class="hint" style="text-align:center;margin-top:10px">Goes to <a data-email href="#"></a>.{extra}</p>'

def gear_form(kind, button, pickup=False):
    pick = ""
    if pickup:
        pick = '''<fieldset><legend>When and where</legend>
 <div class="two"><div class="field"><label for="f-town">Town *</label><select id="f-town" name="town" required><option value="">Choose a town</option><option>Falmouth</option><option>Mashpee</option><option>Sandwich</option><option>Bourne</option><option>Cotuit</option><option>Hyannis</option></select></div>
 <div class="field"><label for="f-date">Date *</label><input id="f-date" name="date" type="date" required></div></div>
 <div class="field"><label for="f-street">Pickup address *</label><input id="f-street" name="pickup_address" type="text" required maxlength="200" autocomplete="street-address"></div>
 <div class="field"><label for="f-window">Two-hour window *</label><select id="f-window" name="window" required><option value="">Choose a window</option><option>8–10 am</option><option>10 am–12 pm</option><option>12–2 pm</option><option>2–4 pm</option><option>4–6 pm</option></select></div>
 <label class="choice"><input type="checkbox" name="porch_ok"><span>Leave the bag on the porch — no need to wait.</span></label>
 <div class="field"><label for="f-porch">Porch or access note <span class="opt">optional</span></label><textarea id="f-porch" name="access_note" maxlength="500" placeholder="Gate code, dogs, which door…"></textarea></div>
</fieldset>'''
    collect_default = ' checked' if pickup else ''
    return f'''<form class="c4l" data-kind="{kind}" data-need-photo data-thanks="We'll write you to confirm{' your pickup window' if pickup else ''}. Written gift acknowledgment comes after we receive the gear.">
{HP}
<fieldset data-photos><legend>Start with a photo</legend>
 <p class="hint">On a phone this opens the camera. Add at least one photo for each kind of gear you are giving.</p>
 <input id="{kind}-cam" type="file" accept="image/*" capture="environment" hidden>
 <input id="{kind}-lib" type="file" accept="image/*" multiple hidden>
 <div class="photo-bar"><button type="button" class="btn" data-pick="{kind}-cam">Take photo</button><button type="button" class="btn light" data-pick="{kind}-lib">From library</button></div>
 <div class="thumbs">No photos yet. Snap the bag, the shoes, the rain jacket — whatever is going out.</div>
</fieldset>
<fieldset data-require-one="Check at least one kind of gear you are giving."><legend>What are you giving?</legend>
 <p class="hint">Check any that apply. Each one needs a photo above.</p>
 <div class="choices cols">
  <label class="choice"><input type="checkbox" name="items" value="Clubs and bags" data-multi><span>Clubs and bags</span></label>
  <label class="choice"><input type="checkbox" name="items" value="Golf shoes" data-multi><span>Golf shoes</span></label>
  <label class="choice"><input type="checkbox" name="items" value="Apparel" data-multi><span>Apparel<small>Shirts, rain gear, hats, gloves, belts</small></span></label>
  <label class="choice"><input type="checkbox" name="items" value="Other golf gear" data-multi><span>Other golf gear</span></label>
 </div>
</fieldset>
<fieldset><legend>How we collect</legend><div class="choices">
 <label class="choice"><input type="radio" name="collect" value="Pickup at my place" required{collect_default}><span>Pickup at my place</span></label>
 <label class="choice"><input type="radio" name="collect" value="Drop in Falmouth"><span>I will drop in Falmouth</span></label>
 <label class="choice"><input type="radio" name="collect" value="Drop in Mashpee"><span>I will drop in Mashpee</span></label>
 <label class="choice"><input type="radio" name="collect" value="Leave with an affiliate"><span>I will leave it with an affiliate</span></label>
</div></fieldset>
{pick}
{you()}
<fieldset><legend>Optional details</legend>
 <div class="two"><div class="field"><label for="f-hand">Left or right <span class="opt">optional</span></label><select id="f-hand" name="hand"><option>Not sure</option><option>Right</option><option>Left</option><option>Mixed</option></select></div>
 <div class="field"><label for="f-fit">Men's, women's, or junior <span class="opt">optional</span></label><select id="f-fit" name="fit"><option>Not sure</option><option>Men's</option><option>Women's</option><option>Junior</option><option>Mixed</option></select></div></div>
 <div class="field"><label for="f-shoe">Shoe size <span class="opt">optional</span></label><input id="f-shoe" name="shoe_size" type="text" maxlength="20"></div>
 <div class="field"><label for="f-est">Your estimate <span class="opt">optional</span></label><input id="f-est" name="donor_estimate" type="text" maxlength="60" placeholder="Your estimate — for your records. We do not appraise."><p class="hint">For your records. We do not appraise.</p></div>
</fieldset>
<fieldset><legend>Gift</legend><div class="choices">
 <label class="choice"><input type="checkbox" name="acknowledgment" checked><span>Email me a written gift acknowledgment after you receive the items.</span></label>
 <label class="choice"><input type="checkbox" name="gift_terms" required><span>This is a gift. Items are not returned. Surplus may be auctioned.</span></label>
</div>
 <p class="hint">Written acknowledgment is emailed after the gear is actually received. This site does not print a dollar appraisal.</p>
 <label class="choice"><input type="checkbox" name="save_local"><span>Save this donation so I can see it later. Guest submit still works — this only keeps a copy on this phone. No login.</span></label>
</fieldset>
<div class="submit-row"><button class="btn" type="submit">{button}</button></div>
<div class="form-status" aria-live="polite"></div>
{goes_to(" No account required.")}
</form>'''

PAGES = {}

PAGES["index.html"] = ("Clubs for Love", DESC, f'''
<section class="hero">
 <div class="hero-img"><picture><source srcset="images/porch-bags.webp" type="image/webp"><img src="images/porch-bags.jpg" alt="Two worn golf bags leaning on a shingled Cape Cod porch rail beside hydrangeas" fetchpriority="high"></picture></div>
 <div class="wrap"><div class="hero-card">
  <p class="eyebrow">Cape Cod</p>
  <h1>Used or new, golf clubs on Cape Cod become a first bag for someone in recovery.</h1>
  <p class="lead">Give the set in the garage — used or new — or give a round at your course. Shops, simulators, and neighbors all count. No login to give.</p>
  <div class="cta-row"><a class="btn" href="donate.html">Donate gear</a><a class="btn light" href="request.html">Need clubs</a><a class="btn sand" href="sponsors.html">Give a round</a></div>
 </div></div>
</section>
<section class="section"><div class="wrap">
 <p class="eyebrow">How it works</p><h2>Four quiet steps.</h2>
 <div class="grid g4" style="margin-top:18px">
  <a class="card" href="donate.html">{ICON["camera"]}<p class="num">01</p><h3>Photo</h3><p>Snap the clubs, shoes, or rain gear from the porch.</p></a>
  <a class="card" href="pickup.html">{ICON["truck"]}<p class="num">02</p><h3>Pickup or drop</h3><p>We come to you, or you leave a bag in Falmouth or Mashpee.</p></a>
  <a class="card" href="about.html">{ICON["hands"]}<p class="num">03</p><h3>We match or auction</h3><p>A first bag goes out. Extra sets may be auctioned. Gifted rounds get someone on the tee.</p></a>
  <div class="card">{ICON["flag"]}<p class="num">04</p><h3>Someone tees off</h3><p>Auction money pays green fees, lessons, and recovery golf days.</p></div>
 </div>
</div></section>
<section class="section tight"><div class="wrap"><div class="band">
 <div><p class="eyebrow">Next pickup</p><h2>Saturday windows on the Upper Cape.</h2><p>Falmouth, Mashpee, Sandwich, Bourne, Cotuit, Hyannis. Book a two-hour window. Leave the bag on the porch if that is easier.</p></div>
 <a class="btn light" href="pickup.html">Book pickup</a>
</div></div></section>
<section class="section"><div class="wrap">
 <p class="eyebrow">A round, not only a bag</p><h2>Donate a round. Sponsor a round.</h2>
 <p class="lead">Courses, shops, and golf simulators can gift a tee time or a bay. A person or a business can cover a green fee, a lesson, or a recovery golf day.</p>
 <div class="grid g2" style="margin-top:18px">
  <a class="card photo-card" href="sponsors.html#offer"><picture><source srcset="images/gifted-round.webp" type="image/webp"><img loading="lazy" src="images/gifted-round.jpg" alt="A weathered bench on a sandy Cape Cod golf course with a gift note"></picture><div class="body"><h3>Donate a round</h3><p>Your course, range, or simulator gifts a tee time or a bay. We match it to someone in recovery who is ready to play.</p><span class="textlink">Gift a tee time</span></div></a>
  <a class="card photo-card" href="sponsors.html#offer"><picture><source srcset="images/simulator-bay.webp" type="image/webp"><img loading="lazy" src="images/simulator-bay.jpg" alt="A cozy golf simulator bay with a fairway on screen and clubs in a barrel"></picture><div class="body"><h3>Sponsor a round</h3><p>A shop, a club, a simulator, or a neighbor pays the green fee, the lesson, or the recovery nine.</p><span class="textlink">Sponsor a round</span></div></a>
 </div>
</div></section>
<section class="section"><div class="wrap story">
 <div class="placeholder-img">A photo will sit here when a story is shared.</div>
 <div><p class="eyebrow">A story will live here</p><h2>The first bag.</h2><p class="lead">We do not invent testimonials. When someone in recovery wants their round told, it will sit here — the porch, the bag, the first tee.</p><a class="textlink" href="stories.html">See the stories page</a></div>
</div></section>
<section class="section"><div class="wrap">
 <div style="display:flex;justify-content:space-between;align-items:end;gap:12px;flex-wrap:wrap"><div><p class="eyebrow">Drop-off</p><h2>Two addresses.</h2><p class="muted">Park, text on arrival, leave the bag. Maps and hours are on each card.</p></div><a class="btn sm ghost" href="drop-off.html">Drop-off page</a></div>
 <div class="grid g2" style="margin-top:18px">{site_card("falmouth")}{site_card("mashpee")}</div>
</div></section>
<section class="section"><div class="wrap">
 <p class="eyebrow">Work with us</p><h2>Hold a barrel. Host a night.</h2>
 <div class="grid g2" style="margin-top:18px">
  <a class="card" href="affiliates.html"><h3>Affiliates</h3><p>Pro shops, gyms, simulators, churches, sober homes. Indoor storage and a person to ask for.</p><span class="textlink">Apply as a drop site</span></a>
  <a class="card" href="sponsors.html"><h3>Sponsors</h3><p>Courses, shops, and simulators: donate a round, sponsor a round, or host an auction night.</p><span class="textlink">Give a round</span></a>
 </div>
</div></section>
''', ())

PAGES["donate.html"] = ("Donate gear", "Give used or new golf clubs, shoes, or apparel on Cape Cod. Take a photo, tell us how to collect it, send. No login.", f'''
<section class="page-head"><div class="wrap narrow"><p class="eyebrow">Give</p><h1>Donate gear.</h1><p class="lead">Used or new. Take a photo, tell us how to collect it, send. No login. Written gift acknowledgment after we receive the items — we do not appraise.</p></div></section>
<section class="section" style="padding-top:10px"><div class="wrap">
<p class="side-note">To gift a tee time, a simulator bay, or a green fee, <a class="textlink" href="sponsors.html">donate or sponsor a round</a>.</p>
{gear_form("donation", "Send donation")}
</div></section>''', ("forms",))

PAGES["pickup.html"] = ("Book a pickup", "Book a two-hour golf gear pickup window in Falmouth, Mashpee, Sandwich, Bourne, Cotuit or Hyannis.", f'''
<section class="page-head"><div class="wrap narrow"><p class="eyebrow">Upper Cape</p><h1>Book a pickup.</h1><p class="lead">We run two-hour windows in Falmouth, Mashpee, Sandwich, Bourne, Cotuit, Hyannis. Leave the bag on the porch if you will not be home.</p></div></section>
<section class="section" style="padding-top:10px"><div class="wrap">
{gear_form("pickup", "Request pickup", pickup=True)}
</div></section>''', ("forms",))

PAGES["request.html"] = ("Need clubs?", "A first bag for a person in recovery, a coach, or a house on Cape Cod. Tell us height, hand, and level and we match what we have.", f'''
<section class="page-head"><div class="wrap narrow"><p class="eyebrow">A first bag</p><h1>Need clubs?</h1><p class="lead">For a person in recovery, a coach, or a house. Height, hand, beginner or returning — we match what we have.</p></div></section>
<section class="section" style="padding-top:10px"><div class="wrap">
<form class="c4l" data-kind="request" data-thanks="We'll write you when we have a bag that fits.">
{HP}
<fieldset><legend>You</legend>
 <div class="field"><label for="f-name">Your name *</label><input id="f-name" name="name" type="text" autocomplete="name" required maxlength="120"></div>
 <div class="field"><label for="f-email">Email *</label><input id="f-email" name="email" type="email" autocomplete="email" required maxlength="200"></div>
 <div class="field"><label for="f-phone">Phone <span class="opt">optional</span></label><input id="f-phone" name="phone" type="tel" autocomplete="tel" maxlength="30"></div>
</fieldset>
<fieldset><legend>Who is this for?</legend><div class="choices">
 <label class="choice"><input type="radio" name="for_whom" value="A person in recovery" required checked><span>A person in recovery</span></label>
 <label class="choice"><input type="radio" name="for_whom" value="A coach"><span>A coach</span></label>
 <label class="choice"><input type="radio" name="for_whom" value="A house / program"><span>A house / program</span></label>
</div></fieldset>
<fieldset><legend>Fit</legend>
 <div class="two"><div class="field"><label for="f-height">Height <span class="opt">optional</span></label><input id="f-height" name="height" type="text" maxlength="20" placeholder="5 ft 8 in"><p class="hint">Helps us match shaft length.</p></div>
 <div class="field"><label for="f-hand">Hand</label><select id="f-hand" name="hand"><option>Right</option><option>Left</option><option>Either</option></select></div></div>
 <div class="two"><div class="field"><label for="f-level">Beginner or returning</label><select id="f-level" name="level"><option>Beginner — first bag</option><option>Returning to the game</option></select></div>
 <div class="field"><label for="f-qty">How many sets <span class="opt">for a house</span></label><input id="f-qty" name="sets" type="number" min="1" max="20" value="1"></div></div>
 <div class="field"><label for="f-note">Anything else <span class="opt">optional</span></label><textarea id="f-note" name="note" maxlength="1000"></textarea></div>
 <p class="hint">Please don't share medical details. We only need what helps us fit a bag.</p>
</fieldset>
<div class="submit-row"><button class="btn" type="submit">Send request</button></div>
<div class="form-status" aria-live="polite"></div>
{goes_to()}
</form></div></section>''', ("forms",))

PAGES["drop-off.html"] = ("Drop-off", "Two Clubs for Love drop sites: Falmouth (316 Gifford Street) and Mashpee (Family Kung Fu & Wellness, Route 151).", f'''
<section class="page-head"><div class="wrap"><p class="eyebrow">Leave a bag</p><h1>Two drop sites.</h1><p class="lead">Falmouth and Mashpee. Park, text on arrival, ask for Clubs for Love. Hours are placeholders until we post them.</p></div></section>
<section class="section" style="padding-top:10px"><div class="wrap">
 <div class="grid g2">{site_card("falmouth")}{site_card("mashpee")}</div>
 <p style="margin-top:22px">Need someone to meet you? Write <a data-email href="#"></a> before you pull in.</p>
 <a class="btn" href="donate.html">Tell us what you are dropping</a>
</div></section>''', ())

PAGES["sponsors.html"] = ("Donate a round. Sponsor a round.", "Courses, shops and golf simulators on Cape Cod can gift a tee time or a bay. Anyone can sponsor a green fee, lesson or recovery nine.", f'''
<section class="page-head"><div class="wrap"><p class="eyebrow">Courses, shops, simulators</p><h1>Donate a round. Sponsor a round.</h1><p class="lead">A tee time from a club. A bay at a simulator. A green fee from a neighbor. We match the round to someone in recovery.</p></div></section>
<section class="section" style="padding-top:10px"><div class="wrap">
 <div class="grid g2">
  <div class="card photo-card"><picture><source srcset="images/gifted-round.webp" type="image/webp"><img loading="lazy" src="images/gifted-round.jpg" alt="A bench beside a sandy fairway"></picture><div class="body"><h2 style="font-size:1.5rem">Donate a round</h2><p>If you run a course, a shop, or a golf simulator, gift a tee time or a bay. No login. We write you when a player is ready.</p></div></div>
  <div class="card photo-card"><picture><source srcset="images/simulator-bay.webp" type="image/webp"><img loading="lazy" src="images/simulator-bay.jpg" alt="A golf simulator bay"></picture><div class="body"><h2 style="font-size:1.5rem">Sponsor a round</h2><p>A business or a person covers the green fee, a lesson, or a recovery nine. Gear still goes through <a href="donate.html">Donate gear</a>.</p></div></div>
 </div>
 <form class="c4l" id="offer" data-kind="sponsor" style="margin-top:40px" data-thanks="We'll write you when a player is ready.">
 {HP}
 <fieldset><legend>Tell us about you</legend>
  <div class="field"><label for="f-org">Club, shop, simulator, or business *</label><input id="f-org" name="organization" type="text" required maxlength="160"></div>
  <div class="field"><label for="f-name">Contact name *</label><input id="f-name" name="name" type="text" autocomplete="name" required maxlength="120"></div>
  <div class="field"><label for="f-email">Email *</label><input id="f-email" name="email" type="email" autocomplete="email" required maxlength="200"></div>
  <div class="field"><label for="f-phone">Phone <span class="opt">optional</span></label><input id="f-phone" name="phone" type="tel" maxlength="30"></div>
 </fieldset>
 <fieldset data-require-one="Check at least one thing you might offer."><legend>What you might offer</legend><div class="choices">
  <label class="choice"><input type="checkbox" name="offers" value="Donate a round (tee time)" data-multi><span>Donate a round — a tee time at our course</span></label>
  <label class="choice"><input type="checkbox" name="offers" value="Donate a simulator bay" data-multi><span>Donate a simulator bay</span></label>
  <label class="choice"><input type="checkbox" name="offers" value="Sponsor a round" data-multi><span>Sponsor a round — green fee, lesson, or recovery nine</span></label>
  <label class="choice"><input type="checkbox" name="offers" value="Bag barrel" data-multi><span>Bag barrel in the shop or bag room</span></label>
  <label class="choice"><input type="checkbox" name="offers" value="Host an auction night" data-multi><span>Host an auction night</span></label>
  <label class="choice"><input type="checkbox" name="offers" value="Something else" data-multi><span>Something else</span></label>
 </div>
  <div class="field"><label for="f-note">Note <span class="opt">optional</span></label><textarea id="f-note" name="note" maxlength="1000"></textarea></div>
 </fieldset>
 <div class="submit-row"><button class="btn" type="submit">Send — donate or sponsor a round</button></div>
 <div class="form-status" aria-live="polite"></div>
 {goes_to()}
 </form>
</div></section>''', ("forms",))

PAGES["affiliates.html"] = ("Hold a barrel", "Pro shops, gyms, golf simulators, churches and sober homes on Cape Cod can host a Clubs for Love drop barrel.", f'''
<section class="page-head"><div class="wrap narrow"><p class="eyebrow">Drop sites</p><h1>Hold a barrel.</h1><p class="lead">Pro shops, gyms, golf simulators, churches, sober homes. Indoor storage, posted hours, a person to ask for. Courses and simulators that want to donate a round can use Give a round.</p></div></section>
<section class="section" style="padding-top:10px"><div class="wrap">
<p class="side-note">Clubs, shops, and simulators offering a round — <a class="textlink" href="sponsors.html">give a round</a>.</p>
<form class="c4l" data-kind="affiliate" data-thanks="We'll write you about setting up a barrel.">
{HP}
<fieldset><legend>Your place</legend>
 <div class="field"><label for="f-org">Business or house *</label><input id="f-org" name="organization" type="text" required maxlength="160"></div>
 <div class="field"><label for="f-type">What kind of place</label><select id="f-type" name="place_type"><option>Pro shop</option><option>Golf simulator</option><option>Gym</option><option>Church</option><option>Sober home</option><option>Other</option></select></div>
 <div class="field"><label for="f-name">Contact name *</label><input id="f-name" name="name" type="text" autocomplete="name" required maxlength="120"></div>
 <div class="field"><label for="f-email">Email *</label><input id="f-email" name="email" type="email" autocomplete="email" required maxlength="200"></div>
 <div class="field"><label for="f-phone">Phone <span class="opt">optional</span></label><input id="f-phone" name="phone" type="tel" maxlength="30"></div>
 <div class="field"><label for="f-addr">Address <span class="opt">optional</span></label><textarea id="f-addr" name="address" maxlength="400"></textarea></div>
 <div class="field"><label for="f-hours">Hours you can take drop-offs <span class="opt">optional</span></label><input id="f-hours" name="hours" type="text" maxlength="200"></div>
 <label class="choice"><input type="checkbox" name="indoor_storage"><span>We can store bags indoors, dry.</span></label>
</fieldset>
<div class="submit-row"><button class="btn" type="submit">Apply to be a drop site</button></div>
<div class="form-status" aria-live="polite"></div>
{goes_to()}
</form></div></section>''', ("forms",))

PAGES["stories.html"] = ("Stories", "Stories of golf in recovery on Cape Cod — only when they are real. No invented testimonials.", '''
<section class="page-head"><div class="wrap"><p class="eyebrow">Not yet</p><h1>Stories, when they are real.</h1><p class="lead">We will not write fake testimonials. These cards wait for a golfer, a donor, or a house that wants the round told.</p></div></section>
<section class="section" style="padding-top:10px"><div class="wrap">
 <div class="grid g3">
  <div class="card photo-card"><picture><source srcset="images/first-bag.webp" type="image/webp"><img loading="lazy" src="images/first-bag.jpg" alt="A golf bag by a doorway, waiting for its first round"></picture><div class="body"><p class="eyebrow">Placeholder</p><h2 style="font-size:1.4rem">The first bag</h2><p>A story will live here. If golf in recovery is yours, write <a data-email data-subject="Story" href="#"></a>.</p></div></div>
  <div class="card"><p class="eyebrow">Placeholder</p><h2 style="font-size:1.4rem">A porch in Falmouth</h2><p>A story will live here. If golf in recovery is yours, write <a data-email data-subject="Story" href="#"></a>.</p></div>
  <div class="card"><p class="eyebrow">Placeholder</p><h2 style="font-size:1.4rem">Nine holes</h2><p>A story will live here. If golf in recovery is yours, write <a data-email data-subject="Story" href="#"></a>.</p></div>
 </div>
 <p style="margin-top:24px"><a class="btn" href="contact.html?topic=story">Share a story</a></p>
 <p class="hint">We only share a story with the person's written OK, and they can ask us to take it down any time.</p>
</div></section>''', ())

PAGES["calendar.html"] = ("Calendar", "Recovery 9-hole days, intro clinics and auction nights on the Upper Cape.", '''
<section class="page-head"><div class="wrap"><p class="eyebrow">Coming</p><h1>Recovery 9-hole days and clinics.</h1><p class="lead">We will list dates here when a course, a coach, and a Saturday line up. Sign in to say you're interested, or email to get on the list.</p></div></section>
<section class="section" style="padding-top:10px"><div class="wrap">
 <div class="grid g3" id="events">
  <div class="card"><p class="eyebrow">Recovery 9-hole</p><h3>Upper Cape — course TBA</h3><p class="muted">Date TBA</p></div>
  <div class="card"><p class="eyebrow">Intro clinic</p><h3>Mashpee</h3><p class="muted">Date TBA</p></div>
  <div class="card"><p class="eyebrow">Auction night</p><h3>Host club TBA</h3><p class="muted">Date TBA</p></div>
 </div>
 <p style="margin-top:24px">Write <a data-email data-subject="calendar" href="#"></a> with the subject “calendar” and we will tell you the next date.</p>
 <a class="btn" href="contact.html?topic=calendar">Get on the list</a>
</div></section>''', ("calendar",))

PAGES["about.html"] = ("Why golf in recovery", "Clubs for Love gives people in recovery on Cape Cod a first bag, outdoor time, and a round. Part of Root to Rise.", '''
<section class="page-head"><div class="wrap narrow"><p class="eyebrow">Root to Rise</p><h1>Why golf in recovery.</h1><p class="lead">A bag of your own. Outdoor time. A morning that is not a meeting and not a couch. Recovery is named in plain English here because that is the work.</p></div></section>
<section class="section" style="padding-top:10px"><div class="wrap narrow">
 <p class="eyebrow">The work</p><h2>A first bag.</h2>
 <p>People leaving treatment, or walking it in a house, should not have to buy a starter set to take a walk on a public nine. Used or new clubs, shoes, and rain gear go out as gifts. Courses and simulators can donate a round. Anyone can sponsor one. Extra sets may be auctioned. That money pays green fees, lessons, and recovery golf days.</p>
 <p class="eyebrow" style="margin-top:30px">The home</p><h2>Root to Rise.</h2>
 <p>Clubs for Love is part of Root to Rise, a recovery community in Mashpee and Falmouth — coaching, meals, work, and a chair at the table. This site is only the golf arm. The only inbox is <a data-email href="#"></a>.</p>
 <p>We are not printing tax-deductible language until a 501(c)(3) EIN is on the page. For now: gift acknowledgment, after the gear is received.</p>
 <p style="margin-top:20px"><a class="btn" href="donate.html">Donate gear</a> <a class="btn ghost" href="contact.html">Write us</a></p>
</div></section>''', ())

PAGES["contact.html"] = ("Write us", "Contact Clubs for Love on Cape Cod. One inbox for donations, pickups, drop sites, sponsors and stories.", f'''
<section class="page-head"><div class="wrap narrow"><p class="eyebrow">One inbox</p><h1>Write us.</h1><p class="lead">The only email on this site is <a data-email href="#"></a>. Every donate, pickup, affiliate, sponsor, and contact form goes there.</p></div></section>
<section class="section" style="padding-top:10px"><div class="wrap">
<form class="c4l" data-kind="contact" data-thanks="We'll write you back.">
{HP}
<fieldset><legend>Message</legend>
 <div class="field"><label for="f-name">Name *</label><input id="f-name" name="name" type="text" autocomplete="name" required maxlength="120"></div>
 <div class="field"><label for="f-email">Email *</label><input id="f-email" name="email" type="email" autocomplete="email" required maxlength="200"></div>
 <div class="field"><label for="f-topic">About</label><select id="f-topic" name="topic"><option value="general">A question</option><option value="calendar">Get on the calendar list</option><option value="story">Share a story</option><option value="volunteer">Volunteer</option><option value="other">Something else</option></select></div>
 <div class="field"><label for="f-msg">Message *</label><textarea id="f-msg" name="message" required maxlength="3000"></textarea></div>
</fieldset>
<div class="submit-row"><button class="btn" type="submit">Send message</button></div>
<div class="form-status" aria-live="polite"></div>
{goes_to()}
</form>
<h2 style="margin-top:50px">The two addresses</h2>
<div class="grid g2" style="margin-top:14px">{site_card("falmouth")}{site_card("mashpee")}</div>
</div></section>
<script>(function(){{var t=new URLSearchParams(location.search).get("topic");var s=document.getElementById("f-topic");if(t&&s&&s.querySelector('option[value="'+t+'"]'))s.value=t;}})();</script>''', ("forms",))

PAGES["account.html"] = ("My account", "Sign in to Clubs for Love to see the forms you sent, follow events, and manage your data.", '''
<section class="page-head"><div class="wrap narrow"><p class="eyebrow">Optional</p><h1>My account.</h1><p class="lead">Giving never needs a login. An account just keeps your forms and event interest in one place.</p></div></section>
<section class="section" style="padding-top:10px"><div class="wrap narrow"><div id="account-area"><p class="hint">Loading…</p></div></div></section>''', ("forms", "account"))

PAGES["staff.html"] = ("Staff", "Clubs for Love staff page.", '''
<section class="page-head"><div class="wrap"><p class="eyebrow">Staff only</p><h1>Staff page.</h1><p class="lead">Forms, photos, statuses, gift acknowledgments and calendar events. Admins only.</p></div></section>
<section class="section" style="padding-top:10px"><div class="wrap"><div id="staff-area"><p class="hint">Loading…</p></div></div></section>''', ("staff",))

PAGES["privacy.html"] = ("Privacy", "How Clubs for Love handles your information, and how to delete it.", '''
<section class="page-head"><div class="wrap prose"><p class="eyebrow">Plain English</p><h1>Privacy.</h1><p class="lead">Last updated October 19, 2026.</p></div></section>
<section class="section" style="padding-top:10px"><div class="wrap prose">
<h2>What we collect</h2>
<ul>
<li><strong>Forms</strong> (donate, pickup, need clubs, drop site, give a round, contact): your name, email, optional phone and address, what you wrote, and any photos you add. No login is needed.</li>
<li><strong>Accounts</strong> (optional): your email, and if you choose them, a nickname, town, role and phone. If you sign in with Google or Facebook, we receive your name and email from them — nothing else, and we never post for you.</li>
<li><strong>Event interest</strong>: which calendar events you tapped “I'm interested” on. Others only see a count, never names.</li>
<li><strong>“Save on this phone”</strong> keeps a copy only in your own browser. We never see it.</li>
</ul>
<p>Please don't send medical or treatment details. We only need what helps us fit a bag or arrange a pickup.</p>
<h2>How we use it</h2>
<p>Only to arrange pickups and drop-offs, match gear and rounds, email gift acknowledgments, and answer you. We don't sell or rent your information, we don't run ads or trackers, and creating an account does not sign you up for any emails.</p>
<h2>Who can see it</h2>
<p>Forms and photos are stored with our database provider, Supabase, with access rules that let only Clubs for Love staff read them. If you were signed in when you sent a form, you can see it on your account page. Photos are kept in a private storage area, not on the public web. Fonts load from Google Fonts and maps from OpenStreetMap, which may see your IP address like any website.</p>
<h2>How long we keep it</h2>
<p>We keep forms as long as we need them to finish the gift or request and to keep simple records of gifts received, then delete photos and close the form.</p>
<h2 id="data-deletion">Data deletion</h2>
<p>You can delete your data any time:</p>
<ul>
<li><strong>Signed in:</strong> open <a href="account.html#delete">My account</a> and tap “Delete all my Clubs for Love data”. It removes your profile, the forms you sent while signed in, and your event interest right away.</li>
<li><strong>Guest forms, your login itself, or Google/Facebook sign-in data:</strong> email <a data-email data-subject="Delete my data" href="#"></a> with the subject “Delete my data” from the address you used. We delete it within 30 days and confirm by email.</li>
<li><strong>Facebook users:</strong> you can also remove Clubs for Love under Facebook Settings &gt; Apps and Websites; then email us as above and we delete what we received.</li>
</ul>
<h2>Children</h2>
<p>This site is for adults. We do not knowingly collect information from children under 13.</p>
<h2>Questions</h2>
<p>Write <a data-email href="#"></a>.</p>
</div></section>''', ())

PAGES["terms.html"] = ("Terms", "Terms of use for the Clubs for Love website.", '''
<section class="page-head"><div class="wrap prose"><p class="eyebrow">The fine print</p><h1>Terms.</h1><p class="lead">Last updated October 19, 2026.</p></div></section>
<section class="section" style="padding-top:10px"><div class="wrap prose">
<h2>Gifts</h2>
<ul>
<li>Gear you give is a gift. Items are not returned. Surplus may be auctioned, and auction money pays green fees, lessons, and recovery golf days.</li>
<li>We email a written gift acknowledgment after we actually receive the gear. We do not appraise, and this site does not state a dollar value. We are not printing tax-deductible language until a 501(c)(3) EIN is on the page; talk to your tax advisor.</li>
<li>Please only give gear you own, that is clean and safe to use.</li>
</ul>
<h2>Pickups and drop-offs</h2>
<p>Pickup windows are requests until we confirm them by email. If you leave a bag on a porch, it stays your responsibility until we collect it. Drop-site hours may change; text or email before you go.</p>
<h2>Requests for clubs and rounds</h2>
<p>We match what we have, when we have it. Sending a request does not guarantee a set or a round. Gifted rounds and sponsored fees are offered by the course, shop, simulator, or sponsor, under their own rules.</p>
<h2>Using the site</h2>
<ul>
<li>Be honest in forms and don't upload photos of people without their OK, or anything that isn't gear.</li>
<li>Accounts are optional and free. Keep your password private. We may close accounts used for spam or abuse.</li>
<li>Stories are only posted with the person's written OK, and they can ask us to take them down any time.</li>
</ul>
<h2>Health and safety</h2>
<p>Clubs for Love is a giving program, not treatment or medical advice. Golf is physical activity; check with your own provider if you have concerns. If you or someone you love is in crisis, call or text <a href="tel:988">988</a>. In an emergency, dial 911.</p>
<h2>No warranty</h2>
<p>Donated gear is given as-is. The site is provided as-is, and to the extent the law allows, Clubs for Love and Root to Rise are not liable for indirect losses from using it.</p>
<h2>Changes and contact</h2>
<p>We may update these terms and will change the date above when we do. Questions: <a data-email href="#"></a>. See also our <a href="privacy.html">privacy policy</a>.</p>
</div></section>''', ())

def build():
    for page, (title, desc, body, scripts) in PAGES.items():
        noindex = page in ("staff.html",)
        open(os.path.join(ROOT, page), "w").write(head(title, html.escape(desc, quote=True), page, noindex) + body + footer(scripts))
    # 404 (served for any missing path, so it pins a base URL)
    body = '''<section class="page-head"><div class="wrap narrow"><p class="eyebrow">404</p><h1>That page isn't here.</h1><p class="lead">It may have moved. Try the home page, or give gear right now.</p><p><a class="btn" href="index.html">Home</a> <a class="btn ghost" href="donate.html">Donate gear</a></p></div></section>'''
    open(os.path.join(ROOT, "404.html"), "w").write(head("Page not found", "Page not found.", "404.html", True, f'<base href="{SITE}">\n') + body + footer())
    pub = [p for p in PAGES if p not in ("staff.html",)]
    open(os.path.join(ROOT, "sitemap.xml"), "w").write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        "".join(f"  <url><loc>{SITE}{'' if p == 'index.html' else p}</loc></url>\n" for p in pub) + "</urlset>\n")
    print("built", len(PAGES) + 1, "pages")

if __name__ == "__main__":
    build()
