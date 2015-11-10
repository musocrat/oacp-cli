#!/usr/bin/env node

// Todo
// - Add OACP global config command ('config')
// - Add RSA pair generator command for current API ('keygen')
// - Add datbase config command for current API ('config-db')

// Setup
const currentDir = process.cwd()
const cli = require('commander')
const path = require('path')
const info = require('./package.json')
const prompt = require('./lib/prompt')
const file_writer = require('./lib/file_writer')
const keygen = require('./lib/keygen')

// Helpers
const toArray = (str) => (str.split(',').map((e) => e.trim()))
// Helper function for name dependent properties
function named (opts) {
  opts.namespace = opts.name
    .replace(/\.?([A-Z]+)/g, (x, y) => (' ' + y)).trim()
    .replace(/\s+|[,-;\[\]\\\/]/g, '_').toLowerCase()
  opts.dir = path.join(currentDir, opts.name)
}

// CLI application
cli.version(info.version)
  // Command: [new] New OACP API
  .command('new [apiName] [resourceNames...]')
  .description('Create new OACP API, scaffold out each resource by name')
  .option('-i, --interactive', 'Create API interactively')
  .option('-d, --dir <apiDir>', 'API directory')
  .option(
    '-s, --scaffold <resourceNames>',
    'Comma separated list of resources to scaffold',
    toArray
  )
  .action(newApi)

// Initialize CLI
cli.parse(process.argv)

// Initialize our new API
function newApi (apiName, resourceNames, options) {
  var name = apiName || options.name
  var scaffold = resourceNames || options.scaffold
  name = (typeof name === 'function') ? null : name
  scaffold = (typeof scaffold === 'function') ? null : scaffold
  var opts = {
    name: name,
    scaffold: scaffold,
    dir: null,
    namespace: null
  }
  // Interactively set variables for new API if -i option passed
  if (options.interactive) return prompt(opts, createApi)
  named(opts)
  createApi(opts)
}

// Create new API
function createApi (opts) {
  // Prepare scaffold
  opts.scaffold = opts.scaffold.map((s) => s
    .replace(/\.?([A-Z]+)/g, (x, y) => (' ' + y)).trim()
    .replace(/\s+|[,-;\[\]\\\/]/g, '_').toLowerCase())
  opts.scaffoldCamel = opts.scaffold.map((s) => s
    .replace(/^./, s[0].toUpperCase())
    .replace(/(\_\w)/g, (m) => m[1].toUpperCase())
  )
  // Create directory structure and scaffold files
  file_writer(opts)
  // Write private / public key pair to config folder
  keygen(opts)
  // Doneskie
  console.log('\n\x1b[32mNew project is live in ' + opts.dir + ' \x1b[0m ')
  process.exit(0)
}
