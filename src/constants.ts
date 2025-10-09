import dotenv from "dotenv"

dotenv.config()

const requiredEnvironmentVariables = [
    'GITHUB_API_TOKEN',
    'GITLAB_API_TOKEN'
]

const missingVariables = requiredEnvironmentVariables.filter(
    (key) => !process.env[key]
)

if (missingVariables.length > 0) {
    throw new Error(
        'Missing essential environment variables:\n' +
            missingVariables
                .map((key) => `${key}: ${process.env[key] || 'undefined'}`)
                .join('\n')
    )
}

const env = Object.fromEntries(
    requiredEnvironmentVariables.map((key) => [key, process.env[key]])
)

const config = {
    url: {
        github: 'https://api.github.com',
        gitlab: 'https://gitlab.login.no/api/v4'
    },
    tokens: {
        github: env['GITHUB_API_TOKEN'],
        gitlab: env['GITLAB_API_TOKEN']
    },
    name: 'Login-Linjeforening-for-IT',
    group: 'tekkom'
}

export default config
