import config from '../constants.ts'
import packagejson from "../../package.json" with { "type": "json" }

const { version } = packagejson

export async function getAllRepositoriesFromGithub(username: string = "username"): Promise<GithubRepository[]> {
    try {
        const GITHUB_API = `${config.url.github}/orgs/${username}/repos`
        const url = new URL(GITHUB_API)
        url.searchParams.append('type', 'public')
        url.searchParams.append('sort', 'updated')
        const res = await fetch(url.href, {
            headers: {
                "Accept": "application/vnd.github+json",
                "User-Agent": `beegit/${version}`,
                "Authorization": `Bearer ${config.tokens.github}`
            }
        })
    
        if (!res.ok) {
            throw new Error(`GitHub API request failed: ${res.status} ${res.statusText}`)
        }
    
        const data = await res.json() as GithubRepository[]
        return data
    } catch (error) {
        console.log(error)
        return []
    }
}
