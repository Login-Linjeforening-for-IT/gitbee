import config from './constants.ts'
import { getAllRepositoriesFromGithub } from './utils/getAllRepositoriesFromGithub.ts'
import { getAllRepositoriesFromGitlab } from './utils/getAllRepositoriesFromGitlab.ts'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import discordAlert from './utils/discordAlert.ts'

const execAsync = promisify(exec)

let lastUpdateGithub = new Map<string, string>()
let lastUpdateGitlab = new Map<string, string>()

// Sample data structure for repositories
// [
//     { name: 'gitbee', updated: '2025-10-09T02:59:23Z' },
//     ...
// ]

const clonesDir = '/projects'

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

    await execAsync(`git config --global user.name "GitBee"`)
    await execAsync(`git config --global user.email "sync@gitbee.local"`)

    console.log('Start Syncing repositories...')

    let hasUpdates = false

    const githubNames = new Set(githubParsed.map(r => r.name))
    const gitlabNames = new Set(gitlabParsed.map(r => r.name))
    const commonNames = [...githubNames].filter(name => gitlabNames.has(name) && (!config.blacklist || !config.blacklist.includes(name)))

    for (const name of commonNames) {
        const githubRepo = githubParsed.find(r => r.name === name)!
        const gitlabRepo = gitlabParsed.find(r => r.name === name)!

        const lastGh = lastUpdateGithub.get(name)
        const lastGl = lastUpdateGitlab.get(name)

        if ((!lastGh || lastGh !== githubRepo.updated) || (!lastGl || lastGl !== gitlabRepo.updated)) {
            console.log(`Updating ${name}`)
            await syncRepo(name)
            lastUpdateGithub.set(name, githubRepo.updated)
            lastUpdateGitlab.set(name, gitlabRepo.updated)
            hasUpdates = true
        }
    }

    return hasUpdates ? 'Sync completed' : 'No updates to sync'
}

async function syncRepo(repoName: string) {
    const repoPath = path.join(clonesDir, repoName)
    const githubUrl = `https://${config.tokens.github}@github.com/${config.name}/${repoName}.git`
    const gitlabUrl = `https://oauth2:${config.tokens.gitlab}@gitlab.login.no/${config.group}/${config.underGroup}/${repoName}.git`


    if (!fs.existsSync(repoPath)) {
        try {
            await execAsync(`git clone -o github ${githubUrl} ${repoPath}`)
        } catch (error) {
            console.error(`Failed to clone ${repoName} from github:`, error)
            return
        }
    }

    const { stdout: remotes } = await execAsync('git remote', { cwd: repoPath })
    if (!remotes.includes('github')) {
        await execAsync(`git remote add github ${githubUrl}`, { cwd: repoPath })
    }

    if (!remotes.includes('gitlab')) {
        await execAsync(`git remote add gitlab ${gitlabUrl}`, { cwd: repoPath })
    }

    try {
        await execAsync(`git fetch gitlab`, { cwd: repoPath })
    } catch (error) {
        console.error(`Failed to fetch gitlab for ${repoName}:`, error)
    }

    const { stdout: gitlabRemotes } = await execAsync(`git branch -r | grep gitlab`, { cwd: repoPath })
    const availableGitlabBranches = gitlabRemotes.split('\n').map(line => line.trim().replace('gitlab/', '')).filter(Boolean)

    try {
        const { stdout: branchesOutput } = await execAsync(`git ls-remote --heads github`, { cwd: repoPath })
        const availableBranches = branchesOutput.split('\n').map(line => line.split('\t')[1]?.replace('refs/heads/', '')).filter(Boolean)
        
        const branches = ['main', 'dev']
        for (const branch of branches) {
            if (availableBranches.includes(branch)) {
                await execAsync(`git checkout -B ${branch} github/${branch}`, { cwd: repoPath })
                
                await execAsync(`git pull --rebase github ${branch}`, { cwd: repoPath })
                
                if (availableGitlabBranches.includes(branch)) {
                    try {
                        await execAsync(`git pull --rebase gitlab ${branch}`, { cwd: repoPath })
                    } catch (gitlabError) {
                        const errorMessage = (gitlabError as Error).message
                        if (errorMessage.includes("could not apply") || errorMessage.includes("Resolve all conflicts")) {
                            try {
                                await execAsync(`git rebase --abort`, { cwd: repoPath })
                                console.warn(`Aborted rebase due to conflict for ${branch} in ${repoName}`)
                            } catch (abortError) {
                                console.warn(`Failed to abort rebase for ${repoName}:`, (abortError as Error).message)
                                discordAlert('Sync conflict', `Failed to abort rebase for ${repoName} on branch ${branch}, please resolve manually.`)
                            }
                        }
                        console.warn(`Failed to pull ${branch} from gitlab for ${repoName}:`, errorMessage)
                        discordAlert('Sync conflict', `Sync conflict in ${repoName} on branch ${branch}, please resolve manually.`)
                    }
                } else {
                    console.log(`Branch ${branch} not available on gitlab for ${repoName}, skipping pull.`)
                }
            }
        }
    } catch (error) {
        console.error(`Failed to sync ${repoName}:`, error)
        discordAlert('Sync conflict', `Sync conflict in ${repoName}, please resolve manually.`)
    }
}
