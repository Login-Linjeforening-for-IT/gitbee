import config from './constants.ts'
import { getAllRepositoriesFromGithub } from './utils/getAllRepositoriesFromGithub.ts'
import { getAllRepositoriesFromGitlab } from './utils/getAllRepositoriesFromGitlab.ts'

export default async function main() {
    const github = await getAllRepositoriesFromGithub(config.name)
    const githubParsed = github.map((repo: GithubRepository) => ({name: repo.name, updated: repo.pushed_at}))
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
    const gitlab = getAllRepositoriesFromGitlab(config.group)
    const gitlabParsed = (await gitlab).map((repo: GitlabRepository) => ({name: repo.name, updated: repo.updated_at}))
    // [
    //     { name: 'gatherbee', updated: '2025-10-03T14:08:44.004Z' },
    //     { name: 'BeeFormed', updated: '2025-10-08T18:52:26.656Z' },
    //     { name: 'ScouterBee', updated: '2025-09-26T13:34:00.717Z' },
    //     { name: 'gitlab-profile', updated: '2025-08-26T19:54:49.720Z' },
    //     { name: 'opentofu', updated: '2025-08-27T08:54:17.808Z' },
    //     { name: 'onprem - mac', updated: '2025-08-27T13:22:24.888Z' },
    //     { name: 'onprem-prod', updated: '2025-04-24T22:05:16.931Z' },
    //     { name: 'BeeKeeper', updated: '2025-10-07T21:04:29.328Z' },
    //     {
    //         name: 'Nucleus Notifications',
    //         updated: '2025-09-09T15:43:16.660Z'
    //     },
    //     { name: 'Jumpbox', updated: '2024-12-19T18:14:30.732Z' },
    //     { name: 'ZammadV3', updated: '2024-11-22T19:42:52.309Z' },
    //     { name: 'dizambee', updated: '2025-09-09T13:09:14.265Z' },
    //     { name: 'presentations', updated: '2024-09-24T14:45:52.328Z' },
    //     { name: 'xen-orchestra', updated: '2024-09-10T14:32:59.588Z' },
    //     { name: 'app-api', updated: '2025-09-09T13:09:08.057Z' },
    //     { name: 'authentik-scripts', updated: '2024-09-03T11:22:25.096Z' },
    //     { name: 'StudentBee', updated: '2025-10-05T17:14:54.265Z' },
    //     { name: 'grafana-dashboards', updated: '2025-01-21T16:22:47.155Z' },
    //     { name: 'billing-api', updated: '2025-08-23T20:04:37.731Z' },
    //     { name: 'memes', updated: '2024-04-08T10:56:41.484Z' },
    //     { name: 'Nettskjema Client', updated: '2024-07-13T11:45:59.513Z' },
    //     { name: 'aws-S3', updated: '2025-09-26T13:36:50.302Z' },
    //     { name: 'dns', updated: '2025-09-02T18:30:05.159Z' },
    //     { name: 'redirect-counter', updated: '2025-02-09T17:19:28.576Z' },
    //     { name: 'redirect-counter', updated: '2024-02-10T17:24:31.286Z' },
    //     { name: 'pipeline-templates', updated: '2024-06-02T16:23:18.352Z' },
    //     { name: 'Extraction', updated: '2024-06-02T16:12:37.889Z' },
    //     { name: 'mend-renovate-bot', updated: '2025-09-26T14:59:04.578Z' },
    //     { name: 'default-config', updated: '2024-06-02T16:08:10.508Z' },
    //     { name: 'infra-prod-cluster', updated: '2025-10-08T21:07:16.241Z' },
    //     { name: 'test-cluster', updated: '2025-10-07T21:10:47.999Z' },
    //     {
    //         name: 'internal-test-cluster',
    //         updated: '2025-10-07T17:27:31.284Z'
    //     },
    //     { name: 'base', updated: '2025-06-30T00:10:11.506Z' },
    //     { name: 'Beehive Admin API', updated: '2025-10-08T18:54:03.770Z' },
    //     { name: 'Beehive Public API', updated: '2025-09-26T13:51:17.456Z' },
    //     { name: 'docker', updated: '2023-09-04T09:01:55.887Z' },
    //     {
    //         name: '1password-connect-stack',
    //         updated: '2023-09-04T09:01:00.157Z'
    //     },
    //     { name: 'project-management', updated: '2024-09-27T17:44:17.924Z' },
    //     { name: 'TekKom Bot', updated: '2025-10-06T18:52:52.229Z' },
    //     { name: 'LogCraft', updated: '2024-02-06T18:52:48.235Z' },
    //     { name: 'Logheim', updated: '2023-03-28T18:10:28.453Z' },
    //     { name: 'tekkom-toolbox', updated: '2024-10-23T11:12:54.810Z' },
    //     {
    //         name: 'login-marketing-material',
    //         updated: '2025-04-01T10:39:50.357Z'
    //     },
    //     { name: 'logfont', updated: '2024-01-24T18:19:28.321Z' },
    //     { name: 'QueenBee', updated: '2025-09-29T15:24:21.223Z' },
    //     { name: 'CMD', updated: '2024-06-02T16:17:58.145Z' },
    //     { name: 'Beehive Database', updated: '2025-02-21T14:44:57.990Z' },
    //     { name: 'Zammad Monitoring', updated: '2024-10-29T22:10:22.052Z' },
    //     { name: 'Nucleus', updated: '2025-10-01T20:23:16.814Z' },
    //     { name: 'Arcade machine', updated: '2024-10-29T21:11:44.945Z' },
    //     { name: 'Beehive Frontend', updated: '2025-10-08T18:44:07.993Z' },
    //     { name: 'pipelines', updated: '2025-09-26T13:55:23.446Z' }
    // ]
    // sync github to gitlab
    // sync gitlab to github
    // handle conflicts?
}

main()
