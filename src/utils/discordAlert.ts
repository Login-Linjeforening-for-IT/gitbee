import config from '../constants.ts'

type Data = {
    content?: string
    embeds: any[]
}

export default async function discordAlert(title: string, description: string, footer?: string) {
    try {
        let data: Data = {
            embeds: [
                {
                    title: title,
                    description: description,
                    color: 0xf85149,
                    timestamp: new Date().toISOString(),
                    footer: footer ? { text: footer } : undefined
                }
            ]
        }

        if (!config.url.webhook) {
            throw new Error('Discord webhook URL is not defined')
        }
        
        const response = await fetch(config.url.webhook, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        return response.status
    } catch (error) {
        console.log(error)
        throw error
    }
}