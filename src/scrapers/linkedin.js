const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function scrapeLinkedIn() {
  console.log('Starting LinkedIn scraper...');
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--ignore-certificate-errors', '--no-sandbox']
    });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    
    // Using LinkedIn public jobs search
    const searchUrl = 'https://www.linkedin.com/jobs/search?keywords=Software%20Engineer&location=Chennai&f_E=1&position=1&pageNum=0';
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait a bit for dynamic content
    await new Promise(r => setTimeout(r, 3000));

    const jobs = await page.evaluate(() => {
      const jobElements = Array.from(document.querySelectorAll('.base-card'));
      return jobElements.slice(0, 10).map(el => {
        const titleEl = el.querySelector('.base-search-card__title');
        const companyEl = el.querySelector('.base-search-card__subtitle');
        const locEl = el.querySelector('.job-search-card__location');
        const dateEl = el.querySelector('.job-search-card__listdate');
        const linkEl = el.querySelector('.base-card__full-link');
        
        return {
          title: titleEl ? titleEl.innerText.trim() : 'Unknown Title',
          company: companyEl ? companyEl.innerText.trim() : 'Unknown Company',
          location: locEl ? locEl.innerText.trim() : 'Chennai',
          experience: 'Fresher', // Inferred from search filter
          url: linkEl ? linkEl.href : '#',
          source: 'LinkedIn',
          date: dateEl ? dateEl.innerText.trim() : 'Recently'
        };
      });
    });

    return jobs;
  } catch (error) {
    console.error('Error scraping LinkedIn:', error.message);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = scrapeLinkedIn;
