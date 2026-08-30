#!/usr/bin/env node

/**
 * Deployment Readiness Checker
 * Validates that your app is ready to deploy
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
};

console.log('\n🔍 Checking Deployment Readiness...\n');

let issuesFound = 0;

// 1. Check if package.json exists and has required scripts
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  log.success('package.json found');

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  const requiredScripts = ['dev', 'build', 'start'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      log.success(`Script "${script}" is defined`);
    } else {
      log.error(`Missing required script: "${script}"`);
      issuesFound++;
    }
  });
} else {
  log.error('package.json not found');
  issuesFound++;
}

// 2. Check for .env.example
const envExamplePath = path.join(process.cwd(), '.env.example');
if (fs.existsSync(envExamplePath)) {
  log.success('.env.example found');
} else {
  log.warning('.env.example not found - consider creating one for documentation');
}

// 3. Check if deployment configs exist
const deploymentConfigs = [
  { file: 'vercel.json', platform: 'Vercel' },
  { file: 'railway.toml', platform: 'Railway' },
  { file: 'netlify.toml', platform: 'Netlify' },
  { file: 'render.yaml', platform: 'Render' },
];

console.log('\n📋 Deployment Configurations:');
deploymentConfigs.forEach(({ file, platform }) => {
  if (fs.existsSync(path.join(process.cwd(), file))) {
    log.success(`${platform} config (${file}) found`);
  } else {
    log.info(`${platform} config (${file}) not found - create if deploying to ${platform}`);
  }
});

// 4. Check .gitignore
console.log('\n🔐 Security Checks:');
const gitignorePath = path.join(process.cwd(), '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');

  const criticalIgnores = ['.env', 'node_modules', '.next'];
  criticalIgnores.forEach(item => {
    if (gitignoreContent.includes(item)) {
      log.success(`${item} is in .gitignore`);
    } else {
      log.error(`${item} is NOT in .gitignore - security risk!`);
      issuesFound++;
    }
  });
} else {
  log.error('.gitignore not found - create one!');
  issuesFound++;
}

// 5. Check for .env (should exist locally but not in git)
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  log.success('.env file exists locally');

  // Parse required env vars
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ADMIN_SESSION_SECRET',
  ];

  console.log('\n🔑 Environment Variables:');
  requiredVars.forEach(varName => {
    if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=your-`)) {
      log.success(`${varName} is set`);
    } else {
      log.warning(`${varName} appears to be missing or using placeholder value`);
    }
  });
} else {
  log.warning('.env file not found - copy from .env.example');
}

// 6. Check node_modules
console.log('\n📦 Dependencies:');
if (fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
  log.success('node_modules found (dependencies installed)');
} else {
  log.error('node_modules not found - run: npm install');
  issuesFound++;
}

// 7. Check Next.js config
const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
const nextConfigJs = path.join(process.cwd(), 'next.config.js');
if (fs.existsSync(nextConfigPath) || fs.existsSync(nextConfigJs)) {
  log.success('Next.js config found');
} else {
  log.warning('next.config file not found');
}

// 8. Summary
console.log('\n' + '='.repeat(50));
if (issuesFound === 0) {
  log.success('All critical checks passed! Ready to deploy ✨');
  console.log('\n📚 Next steps:');
  console.log('   1. Choose a platform (see DEPLOYMENT.md)');
  console.log('   2. Set environment variables on the platform');
  console.log('   3. Deploy!\n');
} else {
  log.error(`Found ${issuesFound} critical issue(s) - fix before deploying`);
  console.log('\n📚 See DEPLOYMENT.md for detailed instructions\n');
  process.exit(1);
}

console.log('='.repeat(50) + '\n');
