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

export default async function sync() {
    // Fetch repositories from Github
    const github = await getAllRepositoriesFromGithub(config.name)
    const githubParsed = github.map((repo: GithubRepository) => ({ name: repo.name, updated: repo.pushed_at }))
    if (!Array.isArray(githubParsed) || !githubParsed.length) {
        return 'Failed to fetch repositories from Github'
    }

    // Fetch repositories from Gitlab
    const gitlab = getAllRepositoriesFromGitlab(config.group)
    const gitlabParsed = (await gitlab).map((repo: GitlabRepository) => ({ name: repo.name, updated: repo.updated_at }))
    if (!Array.isArray(gitlabParsed) || !gitlabParsed.length) {
        return 'Failed to fetch repositories from Gitlab'
    }

    console.log('Syncing repositories...')

    let hasUpdates = false

    // Sync Github repositories
    for (const repo of githubParsed) {
        if (config.blacklist && config.blacklist.includes(repo.name)) {
            console.log(`Skipping blacklisted repo ${repo.name} from github`)
            continue;
        }
        const last = lastUpdateGithub.get(repo.name)
        if (!last || last !== repo.updated) {
            console.log(`Updating ${repo.name} from github`)
            await syncRepo(repo.name, 'github')
            lastUpdateGithub.set(repo.name, repo.updated)
            hasUpdates = true
        }
    }

    // Sync Gitlab repositories
    for (const repo of gitlabParsed) {
        if (config.blacklist && config.blacklist.includes(repo.name)) {
            console.log(`Skipping blacklisted repo ${repo.name} from gitlab`)
            continue;
        }
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

    // Get Personal Access Tokens
    const githubPAT = config.tokens.github
    const gitlabPAT = config.tokens.gitlab

    // Construct remote URLs
    const githubUrl = `https://${githubPAT}@github.com/${config.name}/${repoName}.git`
    const gitlabUrl = `https://oauth2:${gitlabPAT}@gitlab.login.no/${config.group}/${config.underGroup}/${repoName}.git`

    // Clone repo if it doesn't exist
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
        // Add remotes if missing
        const { stdout: remotes } = await execAsync('git remote', { cwd: repoPath })
        if (!remotes.includes('github')) {
            await execAsync(`git remote add github ${githubUrl}`, { cwd: repoPath })
        }
        if (!remotes.includes('gitlab')) {
            await execAsync(`git remote add gitlab ${gitlabUrl}`, { cwd: repoPath })
        }

        const branches = ['main', 'dev']
        for (const branch of branches) {
            // Check if branch exists on both remotes before syncing
            try {
                const githubRefs = await execAsync(`git ls-remote --heads github ${branch}`, { cwd: repoPath });
                const gitlabRefs = await execAsync(`git ls-remote --heads gitlab ${branch}`, { cwd: repoPath });
                const sourceHasBranch = source === 'github' ? githubRefs.stdout.includes(branch) : gitlabRefs.stdout.includes(branch);
                const target = source === 'github' ? 'gitlab' : 'github';
                const targetHasBranch = target === 'github' ? githubRefs.stdout.includes(branch) : gitlabRefs.stdout.includes(branch);

                if (sourceHasBranch && targetHasBranch) {
                    // Pull from source with rebase
                    await execAsync(`git pull ${source} ${branch} --rebase`, { cwd: repoPath });

                    // Ensure branch exists locally before pushing
                    const { stdout: localBranches } = await execAsync('git branch', { cwd: repoPath });
                    const branchList = localBranches.split('\n').map(b => b.trim());
                    const currentBranch = branchList.find(b => b.startsWith('*'))?.replace('*', '').trim();
                    // Only fetch if branch is not present locally AND not checked out
                    if (!branchList.includes(branch) && currentBranch !== branch) {
                        await execAsync(`git fetch ${source} ${branch}:${branch}`, { cwd: repoPath });
                    }

                    // Push to target remote
                    if (target === 'github' && githubPAT) {
                        await execAsync(`git remote set-url github ${githubUrl}`, { cwd: repoPath });
                    }
                    if (target === 'gitlab' && gitlabPAT) {
                        await execAsync(`git remote set-url gitlab ${gitlabUrl}`, { cwd: repoPath });
                    }
                    await execAsync(`git push ${target} ${branch}`, { cwd: repoPath });
                } else {
                    console.log(`Branch ${branch} does not exist on remote ${source}, skipping pull and push.`);
                }
            } catch (err) {
                console.error(`Error verifying branch ${branch} on remotes:`, err);
            }
        }
    } catch (error) {
        console.error(`Failed to sync ${repoName} from ${source}:`, error)
        discordAlert('Merge conflict', `Merge conflict in ${repoName} from ${source}, please resolve manually.`)
    }
}
