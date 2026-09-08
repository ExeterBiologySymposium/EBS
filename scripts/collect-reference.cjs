// Use the already authenticated CLI client; never log credentials.
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const { join } = require('node:path');
const globalModules = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
const { initializeClient } = require(join(globalModules, 'firecrawl-cli/dist/utils/client.js'));
async function main() {
  const client = initializeClient({});
  const result = await client.getCrawlStatus('01a07bbc-16e9-7494-ba58-805460a85075');
  fs.writeFileSync('.firecrawl/hosted-crawl.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ status: result.status, total: result.total, completed: result.completed, saved: result.data?.length, next: result.next }));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
