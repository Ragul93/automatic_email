const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function scrapeIndeed() {
  console.log('Starting Indeed scraper...');
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--ignore-certificate-errors', '--no-sandbox']
    });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    
    const searchUrl = 'https://in.indeed.com/jobs?q=software+engineer+fresher&l=Chennai%2C+Tamil+Nadu';
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait for the job cards to load
    await new Promise(r => setTimeout(r, 4000));

    const jobs = await page.evaluate(() => {
      const jobElements = Array.from(document.querySelectorAll('.job_seen_beacon'));
      return jobElements.slice(0, 10).map(el => {
        const titleEl = el.querySelector('h2.jobTitle span[title]');
        const companyEl = el.querySelector('[data-testid="company-name"]');
        const locEl = el.querySelector('[data-testid="text-location"]');
        const linkEl = el.querySelector('h2.jobTitle a');
        
        return {
          title: titleEl ? titleEl.innerText.trim() : 'Unknown Title',
          company: companyEl ? companyEl.innerText.trim() : 'Unknown Company',
          location: locEl ? locEl.innerText.trim() : 'Chennai',
          experience: 'Fresher',
          url: linkEl ? linkEl.href : '#',
          source: 'Indeed',
          date: 'Recently' // Indeed dates are sometimes harder to extract reliably without clicking
        };
      });
    });

    return jobs;
  } catch (error) {
    console.error('Error scraping Indeed:', error.message);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = scrapeIndeed;
