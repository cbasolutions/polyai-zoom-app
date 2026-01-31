#!/usr/bin/env node

/**
 * Production Deployment Script
 * 
 * This script:
 * 1. Backs up the example projects.ts
 * 2. Copies projects.prod.ts to projects.ts
 * 3. Builds the application
 * 4. Deploys to Cloudflare
 * 5. Restores the example projects.ts
 * 
 * Usage: node scripts/deploy-prod.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECTS_PATH = path.join(__dirname, '../src/config/projects.ts');
const PROJECTS_PROD_PATH = path.join(__dirname, '../src/config/projects.prod.ts');
const PROJECTS_BACKUP_PATH = path.join(__dirname, '../src/config/projects.ts.backup');

function log(message) {
  console.log(`\n📦 ${message}`);
}

function error(message) {
  console.error(`\n❌ ${message}`);
  process.exit(1);
}

function exec(command) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (err) {
    error(`Command failed: ${command}`);
  }
}

function main() {
  log('Starting production deployment...');

  // Step 1: Check if prod config exists
  if (!fs.existsSync(PROJECTS_PROD_PATH)) {
    error('projects.prod.ts not found! Create it from projects.prod.ts template first.');
  }

  // Step 2: Backup current projects.ts
  log('Backing up projects.ts...');
  fs.copyFileSync(PROJECTS_PATH, PROJECTS_BACKUP_PATH);

  try {
    // Step 3: Copy production config
    log('Using production configuration...');
    fs.copyFileSync(PROJECTS_PROD_PATH, PROJECTS_PATH);

    // Step 4: Build
    log('Building application...');
    exec('npm run build');

    // Step 5: Deploy
    log('Deploying to Cloudflare Pages...');
    exec('npx wrangler pages deploy dist --project-name=polyai-zoom-app --branch=main');

    log('✅ Deployment successful!');
  } catch (err) {
    error(`Deployment failed: ${err.message}`);
  } finally {
    // Step 6: Always restore the example config
    log('Restoring example configuration...');
    fs.copyFileSync(PROJECTS_BACKUP_PATH, PROJECTS_PATH);
    fs.unlinkSync(PROJECTS_BACKUP_PATH);
  }

  log('🚀 Production deployment complete!');
  log('Git repository still has sanitized examples.');
}

main();
