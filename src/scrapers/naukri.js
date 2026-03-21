const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function scrapeNaukri() {
  console.log('Starting Naukri scraper...');
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--ignore-certificate-errors', '--no-sandbox']
    });
    const page = await browser.newPage();
    
    // Set viewport and user agent to seem more human
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    
    const searchUrl = 'https://www.naukri.com/fresher-software-jobs-in-chennai';
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    const jobs = await page.evaluate(() => {
      const jobElements = Array.from(document.querySelectorAll('.srp-jobtuple-wrapper'));
      return jobElements.slice(0, 15).map(el => {
        const titleEl = el.querySelector('.title ');
        const companyEl = el.querySelector('.comp-name');
        const locEl = el.querySelector('.locWdth');
        const expEl = el.querySelector('.expwdth');
        const dateEl = el.querySelector('.job-post-day');
        
        return {
          title: titleEl ? titleEl.innerText.trim() : 'Unknown Title',
          company: companyEl ? companyEl.innerText.trim() : 'Unknown Company',
          location: locEl ? locEl.innerText.trim() : 'Chennai',
          experience: expEl ? expEl.innerText.trim() : 'Fresher',
          url: titleEl ? titleEl.href : '#',
          source: 'Naukri',
          date: dateEl ? dateEl.innerText.trim() : 'Recently'
        };
      });
    });

    return jobs;
  } catch (error) {
    console.error('Error scraping Naukri:', error.message);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = scrapeNaukri;
