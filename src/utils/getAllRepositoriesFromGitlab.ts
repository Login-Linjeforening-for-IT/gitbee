import packagejson from "../../package.json" with { "type": "json" }
import config from '../constants.ts'

const { name, version } = packagejson

export async function getAllRepositoriesFromGitlab(group: string = "tekkom"): Promise<GitlabRepository[]> {
    const perPage = 100
    let page = 1
    let projects: any[] = []
    let hasMore = true

    while (hasMore) {
        const url = new URL(`${config.url.gitlab}/groups/${group}/projects`)
        url.searchParams.append('include_subgroups', 'true')
        url.searchParams.append('per_page', perPage.toString())
        url.searchParams.append('page', page.toString())
        const res = await fetch(url.href, {
            headers: {
                "Accept": "application/json",
                "Private-Token": config.tokens.gitlab,
                "User-Agent": `${name}/${version}`,
            },
        })

        if (!res.ok) {
            throw new Error(`GitLab API request failed: ${res.status} ${res.statusText}`)
        }

        const data = await res.json() as GitlabRepository[]
        // removes archived projects
        const activeProjects = data.filter((project: any) => !project.archived)
        projects = projects.concat(activeProjects)
        if (data.length < perPage) {
            hasMore = false
        } else {
            page++
        }
    }

    return projects
}
