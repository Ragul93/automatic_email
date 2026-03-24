const cron = require('node-cron');
require('dotenv').config();

const scrapeNaukri = require('./src/scrapers/naukri');
const scrapeLinkedIn = require('./src/scrapers/linkedin');
const scrapeIndeed = require('./src/scrapers/indeed');
const { aggregateJobs } = require('./src/utils/aggregator');
const { sendEmail } = require('./src/mailer');

async function runJobScraper() {
  console.log(`[${new Date().toISOString()}] Job scraper started.`);
  
  // Run all scrapers in parallel or sequentially. We do it sequentially here to reduce memory spikes.
  const naukriJobs = await scrapeNaukri();
  console.log(`Found ${naukriJobs.length} jobs on Naukri.`);
  
  const linkedinJobs = await scrapeLinkedIn();
  console.log(`Found ${linkedinJobs.length} jobs on LinkedIn.`);
  
  const indeedJobs = await scrapeIndeed();
  console.log(`Found ${indeedJobs.length} jobs on Indeed.`);

  const topJobs = aggregateJobs(naukriJobs, linkedinJobs, indeedJobs);
  console.log(`Aggregated down to top ${topJobs.length} unique jobs.`);

  // We now ALWAYS send an email so you know the script ran successfully, even if 0 jobs were found
  if (topJobs.length > 0) {
    await sendEmail(topJobs);
  } else {
    console.log('No jobs found today. Sending fallback status email.');
    await sendEmail([]); // Sends email letting you know it found 0 jobs
  }
  
  console.log(`[${new Date().toISOString()}] Job scraper finished.`);
}

if (process.argv.includes('--run-now')) {
  console.log('Running script immediately due to --run-now flag...');
  runJobScraper().then(() => {
    console.log('Finished manual run. Exiting.');
    process.exit(0);
  });
} else {
  // Schedule the task to run every day at 8:00 AM
  cron.schedule('0 8 * * *', () => {
    console.log('Triggering scheduled cron job for 8:00 AM...');
    runJobScraper();
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  console.log('Cron job scheduler initialized. Waiting for 8:00 AM (IST) to run...');
}
