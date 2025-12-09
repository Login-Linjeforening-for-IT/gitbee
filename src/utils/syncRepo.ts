
import path from 'path'
import discordAlert from './discordAlert.ts'
import { exec } from 'child_process'
import { promisify } from 'util'
import config from '../constants.ts'
import run from '../run.ts'
import fs from 'fs'

const execAsync = promisify(exec)

export default async function syncRepo(repoName: string) {
    const repoPath = path.join(config.clonesDir, repoName)
    const githubUrl = `https://${config.tokens.github}@github.com/${config.name}/${repoName}.git`
    const underGroup = repoName.includes('cluster') ? 'infrastructure/kubernetes' : config.underGroup
    const gitlabUrl = `https://oauth2:${config.tokens.gitlab}@gitlab.login.no/${config.group}/${underGroup}/${repoName}.git`

    if (!fs.existsSync(repoPath)) {
        try {
            await run('git', ['clone', '-o', 'github', githubUrl, repoPath])
        } catch (error) {
            console.error(`Failed to clone ${repoName} from github:`, error)
            return
        }
    }

    const { stdout: remotes } = await execAsync('git remote', { cwd: repoPath })
    if (!remotes.includes('github')) {
        await run('git', ['remote', 'add', 'github', githubUrl], repoPath)
    }

    if (!remotes.includes('gitlab')) {
        await run('git', ['remote', 'add', 'gitlab', gitlabUrl], repoPath)
    }

    const { stdout: gitlabBranchesOutput } = await execAsync(`git ls-remote --heads gitlab`, { cwd: repoPath })
    const gitlabBranches = gitlabBranchesOutput.split('\n').map(line => line.split('\t')[1]?.replace('refs/heads/', '')).filter(Boolean)

    const { stdout: branchesOutput } = await execAsync(`git ls-remote --heads github`, { cwd: repoPath })
    const githubBranches = branchesOutput.split('\n').map(line => line.split('\t')[1]?.replace('refs/heads/', '')).filter(Boolean)

    const branches = ['main', 'dev']
    for (const branch of branches) {
        if (!githubBranches.includes(branch) || !gitlabBranches.includes(branch)) {
            continue
        }

        try {
            await run('git', ['checkout', '-B', branch, `github/${branch}`], repoPath)
            await run('git', ['pull', '--rebase', 'github', branch], repoPath)
            await run('git', ['pull', '--rebase', 'gitlab', branch], repoPath)
            await run('git', ['push', 'gitlab', branch], repoPath)
            await run('git', ['push', 'github', branch], repoPath)
        } catch (error) {
            const errorMessage = (error as Error).message

            if (errorMessage.includes("could not apply") || errorMessage.includes("Resolve all conflicts")) {
                try {
                    await run('git', ['rebase', '--abort'], repoPath)
                    console.warn(`Aborted rebase due to conflict for ${branch} in ${repoName}`)
                } catch (abortError) {
                    console.warn(`Failed to abort rebase for ${repoName}:`, (abortError as Error).message)
                    discordAlert('Sync conflict', `Failed to abort rebase for ${repoName} on branch ${branch}, please resolve manually.`)
                }
            } else {
                console.error(`Failed to sync ${branch} for ${repoName}:`, errorMessage)
                discordAlert('Sync conflict', `Sync conflict in ${repoName} on branch ${branch}, please resolve manually.`)
            }

            console.error(`Error syncing ${branch} for ${repoName}:`, error)
        }
    }
}
