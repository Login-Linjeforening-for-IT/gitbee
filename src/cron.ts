import sync from './sync.ts'

let isRunning = false

export default function gitSync() {
    setInterval(async() => {
        if (isRunning) {
            console.log('Sync already running, skipping...')
            return
        }

        isRunning = true

        try {
            await sync()
        } finally {
            isRunning = false
        }
    }, 60000)
}
