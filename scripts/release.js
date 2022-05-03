// import { resolve } from 'path'
const { execSync } = require('child_process')
const { readFileSync, writeFileSync } = require('fs')
const { resolve } = require('path')
const { inc: incrementVersion } = require('semver')

// 1. Update version in package.json
// 2. git add .
// 3. git tag
// 4. git push

const helpMessage = [
    'Command usage: npm run release [bumpType] [commitMessage]',
    'bumpType: "major" | "minor" | "patch"',
    'commitMessage: string',
    '',
    'Run `npm run release --help` to see this message',
].join('')

const args = process.argv.slice(2)
// console.log(args)

if (args.length === 0) {
    console.log('You must provide a "bumpType" and a "commitMessage"')
    console.log(helpMessage)
    process.exit()
}

if (args.length === 1) {
    console.log('You must provide a "commitMessage"')
    console.log(helpMessage)
    process.exit()
}

if (args.length > 2) {
    console.log('The "commitMessage" must be surrounded by double quotes')
    console.log(helpMessage)
    process.exit()
}

if (args.indexOf('--help') > -1) {
    console.log(helpMessage)
    process.exit()
}

const [bumpType, commitMessage] = args

const bumpTypes = ['major', 'minor', 'patch']
if (bumpTypes.indexOf(bumpType) == -1) {
    console.log('Invalid "bumpType"')
    console.log(helpMessage)
    process.exit()
}

const matchCommitMessage =
    /^(?<type>[^(:]+)(?:\((?<scope>.+)\))?: ?(?<message>.+)$/
if (!matchCommitMessage.exec(commitMessage)) {
    console.log('Invalid "commitMessage"')
    console.log(helpMessage)
    process.exit()
}

console.log('Updating version in package.json')
const packageJsonPath = resolve('package.json')
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))

const newVersion = incrementVersion(packageJson.version, bumpType)
// console.log(newVersion)

const newPackageJsonContent = {
    ...packageJson,
    version: newVersion,
}
writeFileSync(packageJsonPath, JSON.stringify(newPackageJsonContent, null, 4))

console.log('Committing to git...')
execSync('git add .')
execSync(`git commit -m "${commitMessage}"`)

console.log('Adding git tags...')
execSync(`git tag ${newVersion}`)

console.log('Pushing to git...')
execSync(`git push --follow-tags`)
