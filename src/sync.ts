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

export default async function sync() {
    // [
    //     { name: 'gitbee', updated: '2025-10-09T02:59:23Z' },
    //     { name: 'beehive', updated: '2025-10-08T18:46:25Z' },
    //     { name: 'uibee', updated: '2025-10-08T18:10:43Z' },
    //     { name: 'tekkom-bot', updated: '2025-10-06T18:53:01Z' },
    //     { name: 'default', updated: '2025-10-04T08:50:19Z' },
    //     { name: 'queenbee', updated: '2025-09-22T01:51:54Z' },
    //     { name: 'studentbee', updated: '2025-09-09T11:46:24Z' },
    //     { name: 'workerbee', updated: '2025-10-08T18:57:07Z' },
    //     { name: 'nucleus', updated: '2025-09-11T10:45:44Z' },
    //     { name: 'nucleus-notifications', updated: '2025-09-09T12:07:40Z' },
    //     { name: 'dizambee', updated: '2025-09-09T11:58:34Z' },
    //     { name: 'app-api', updated: '2025-09-09T11:39:27Z' },
    //     { name: 'beehive-database', updated: '2025-04-05T19:56:19Z' }
    // ]

    const github = await getAllRepositoriesFromGithub(config.name)
    const githubParsed = github.map((repo: GithubRepository) => ({name: repo.name, updated: repo.pushed_at}))
    if (!Array.isArray(githubParsed) || !githubParsed.length) {
        return 'Failed to fetch repositories from Github'
    }

    const gitlab = getAllRepositoriesFromGitlab(config.group)
    const gitlabParsed = (await gitlab).map((repo: GitlabRepository) => ({name: repo.name, updated: repo.updated_at}))
    if (!Array.isArray(gitlabParsed) || !gitlabParsed.length) {
        return 'Failed to fetch repositories from Gitlab'
    }

    console.log('Syncing repositories...')

    let hasUpdates = false

    for (const repo of githubParsed) {
        const last = lastUpdateGithub.get(repo.name)
        if (!last || last !== repo.updated) {
            console.log(`Updating ${repo.name} from github`)
            await syncRepo(repo.name, 'github')
            lastUpdateGithub.set(repo.name, repo.updated)
            hasUpdates = true
        }
    }

    for (const repo of gitlabParsed) {
        const last = lastUpdateGitlab.get(repo.name)
        if (!last || last !== repo.updated) {
            console.log(`Updating ${repo.name} from gitlab`)
            await syncRepo(repo.name, 'gitlab')
            lastUpdateGitlab.set(repo.name, repo.updated)
            hasUpdates = true
        }
    }

    return hasUpdates ? 'Sync completed' : 'No updates to sync'
}

async function syncRepo(repoName: string, source: 'github' | 'gitlab') {
    const clonesDir = '/projects'
    const repoPath = path.join(clonesDir, repoName)
    const githubUrl = `git@github.com:${config.name}/${repoName}.git`
    const gitlabUrl = `git@gitlab.login.no:${config.group}/${config.underGroup}/${repoName}.git`

    // clone if not exist
    if (!fs.existsSync(repoPath)) {
        const cloneUrl = source === 'github' ? githubUrl : gitlabUrl
        try {
            await execAsync(`git clone -o ${source} ${cloneUrl} ${repoPath}`)
        } catch (error) {
            console.error(`Failed to clone ${repoName} from ${source}:`, error)
            return
        }
    }

    try {
        // add remotes if not exist
        const { stdout: remotes } = await execAsync('git remote', { cwd: repoPath })
        if (!remotes.includes('github')) {
            await execAsync(`git remote add github ${githubUrl}`, { cwd: repoPath })
        }
        if (!remotes.includes('gitlab')) {
            await execAsync(`git remote add gitlab ${gitlabUrl}`, { cwd: repoPath })
        }

        const branches = ['main', 'dev']
        for (const branch of branches) {
            // pull from source with rebase
            await execAsync(`git pull ${source} ${branch} --rebase`, { cwd: repoPath })

            // push to target
            const target = source === 'github' ? 'gitlab' : 'github'
            await execAsync(`git push ${target} ${branch}`, { cwd: repoPath })
        }
    } catch (error) {
        console.error(`Failed to sync ${repoName} from ${source}:`, error)
        discordAlert('Merge conflict',`Merge conflict in ${repoName} from ${source}, please resolve manually.`)
    }
}