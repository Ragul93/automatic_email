function aggregateJobs(naukriJobs, linkedinJobs, indeedJobs) {
  // Combine all jobs
  let allJobs = [...naukriJobs, ...linkedinJobs, ...indeedJobs];
  
  // Basic deduplication based on title + company combination
  const seen = new Set();
  const uniqueJobs = allJobs.filter(job => {
    const key = `${job.title}-${job.company}`.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  // Sort jobs (optional, we could just shuffle or keep the order they came in)
  // Since we want the "Top 25", we just take the first 25 of the deduplicated list.
  // In a more complex scenario, we'd rank them by keywords matched, but here we depend on the portal's search rank.
  
  const top25Jobs = uniqueJobs.slice(0, 25);
  
  return top25Jobs;
}

module.exports = { aggregateJobs };
