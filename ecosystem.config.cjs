const fs = require('fs')

// Only pass --d1 when a database id has been configured, so local dev works
// before Cloudflare resources are created.
let hasD1 = false
try {
  const cfg = fs.readFileSync('./wrangler.jsonc', 'utf8')
  const m = cfg.match(/"database_id"\s*:\s*"([^"]+)"/)
  hasD1 = Boolean(m && m[1] && !/REPLACE/i.test(m[1]))
} catch (e) {
  hasD1 = false
}

const args = ['wrangler', 'pages', 'dev', 'dist', '--ip', '0.0.0.0', '--port', '3000']
if (hasD1) args.push('--d1=webapp-production', '--local')

module.exports = {
  apps: [
    {
      name: 'webapp',
      script: 'npx',
      args: args.join(' '),
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
    },
  ],
}
