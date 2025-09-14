const { chromium } = require('playwright-extra');
async function scrape(link: string) {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
      viewport: { width: 1366, height: 768 },
      locale: 'en-US',
      timezoneId: 'America/New_York',
    });

    const page = await context.newPage();
    await page.goto(link, {
      timeout: 2 * 60 * 1000,
    });

    await page.waitForLoadState('networkidle');

    /* --------------------------- Find metaTitle of page --------------------------- */
    const title = await page.title();

    /* ---------------------- Find metaDescription of page ---------------------- */
    const metaDescriptionLocator = page.locator('meta[name="description"]');
    let description = '';
    metaDescriptionLocator
      .getAttribute('content')
      .then((item) => (description = item))
      .catch((e) => null);

    /* ------------------------- Find images without alt ------------------------ */
    const imageLocator = page.locator('img:not([alt])');
    const allImages = await imageLocator.all();
    const noAlt = [];
    for (const imgLocator of allImages) {
      const src = await imgLocator.getAttribute('src');
      noAlt.push(src);
    }

    /* --------------------------- Find Canonical Link -------------------------- */
    const canonicalLink = page.locator('link[rel="canonical"]');
    let canonicalHref = '';
    canonicalLink
      .getAttribute('href')
      .then((e) => (canonicalHref = e))
      .catch((e) => null);

    /* ------------------------------ Find Schemas ------------------------------ */
    const jsonLd = [];
    page
      .$$eval("script[type='application/ld+json']", (els) =>
        els.map((el) => JSON.parse(el.innerHTML.trim() || '')),
      )
      .then((i) => i?.forEach((item) => jsonLd.push(item)))
      .catch((e) => null);

    /* ----------------------------- Find all links ----------------------------- */
    const LINK = new URL(link);
    const BASE_URL = `${LINK.protocol}//${LINK.hostname}`;
    const linkLocator = page.locator('a:not(header a):not(footer a):not([id*="BREADCRUMB"] a)');
    const allLinks = await linkLocator.all();
    const internal = [];
    const external = [];
    for (const aLocator of allLinks) {
      const href = await aLocator.getAttribute('href');
      const rel = await aLocator.getAttribute('rel');
      if (!href.startsWith('#') && !!href)
        if (href.startsWith('/') || href.startsWith(BASE_URL)) {
          internal.push({ rel, href: href.startsWith('/') ? `${BASE_URL}${href}` : href });
        } else {
          external.push({ rel, href });
        }
    }

    /* ------------------------- Find count of headings ------------------------- */
    const h1_locator = page.locator('h1');
    const h1_all = await h1_locator.all();
    const h1_array = [];
    for (const h1Locator of h1_all) {
      const innerText = await h1Locator.innerText();
      h1_array.push(innerText);
    }

    const result = {
      title_length: title.length,
      description_length: description.length,
      images: noAlt,
      h1_count: h1_array.length,
      h1_array,
      internal_links: internal,
      external_links: external,
      canonical: canonicalHref,
      schemas: jsonLd,
    };
    // console.dir(result, { depth: null });
    return result;
  } finally {
    await browser.close();
  }
}

export default scrape;
