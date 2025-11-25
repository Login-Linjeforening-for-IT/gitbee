import dotenv from "dotenv"

dotenv.config()

const requiredEnvironmentVariables = [
    'GITHUB_API_TOKEN',
    'GITLAB_API_TOKEN',
    'WEBHOOK_URL'
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
        gitlab: 'https://gitlab.login.no/api/v4',
        webhook: env['WEBHOOK_URL']
    },
    tokens: {
        github: env['GITHUB_API_TOKEN'],
        gitlab: env['GITLAB_API_TOKEN']
    },
    name: 'Login-Linjeforening-for-IT',
    group: 'tekkom',
    underGroup: 'dev',
    blacklist: [
        '.github'
    ]
}

export default config
