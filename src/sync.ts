import config from './constants.ts'
import { getAllRepositoriesFromGithub } from './utils/getAllRepositoriesFromGithub.ts'
import { getAllRepositoriesFromGitlab } from './utils/getAllRepositoriesFromGitlab.ts'
import fs from 'fs'
import run from './run.ts'
import syncRepo from './utils/syncRepo.ts'

let lastUpdateGithub = new Map<string, string>()
let lastUpdateGitlab = new Map<string, string>()

// Sample data structure for repositories
// [
//     { name: 'gitbee', updated: '2025-10-09T02:59:23Z' },
//     ...
// ]

if (!fs.existsSync(config.clonesDir)) {
    fs.mkdirSync(config.clonesDir, { recursive: true })
}

export default async function sync() {
    const github = await getAllRepositoriesFromGithub(config.name)
    const githubParsed = github.map((repo: GithubRepository) => ({ name: repo.name, updated: repo.pushed_at }))
    if (!Array.isArray(githubParsed) || !githubParsed.length) {
        return 'Failed to fetch repositories from Github'
    }

    const gitlab = getAllRepositoriesFromGitlab(config.group)
    const gitlabParsed = (await gitlab).map((repo: GitlabRepository) => ({ name: repo.name, updated: repo.updated_at }))
    if (!Array.isArray(gitlabParsed) || !gitlabParsed.length) {
        return 'Failed to fetch repositories from Gitlab'
    }

    await run('git', ['config', '--global', 'user.name', 'GitBee'])
    await run('git', ['config', '--global', 'user.email', 'sync@gitbee.local'])

    console.log('Start Syncing repositories...')
    console.log('a')
    let hasUpdates = false
    console.log('b')
    
    const githubNames = new Set(githubParsed.map(r => r.name))
    console.log('c')
    const gitlabNames = new Set(gitlabParsed.map(r => r.name))
    console.log('d')
    const commonNames = [...githubNames]
    .filter(name => gitlabNames.has(name) && (!config.blacklist || !config.blacklist.includes(name)))
    console.log('e')
    
    for (const name of commonNames) {
        console.log('f')
        const githubRepo = githubParsed.find(r => r.name === name)!
        const gitlabRepo = gitlabParsed.find(r => r.name === name)!
        
        console.log('g')
        const lastGh = lastUpdateGithub.get(name)
        const lastGl = lastUpdateGitlab.get(name)
        
        console.log('h')
        if ((!lastGh || lastGh !== githubRepo.updated) || (!lastGl || lastGl !== gitlabRepo.updated)) {
            console.log('i')
            console.log(`Updating ${name}`)
            await syncRepo(name)
            console.log('j')
            lastUpdateGithub.set(name, githubRepo.updated)
            lastUpdateGitlab.set(name, gitlabRepo.updated)
            hasUpdates = true
        }
        console.log('k')
    }
    console.log('l')
    
    return hasUpdates ? 'Sync completed' : 'No updates to sync'
}
