import { schedule } from "node-cron"
import sync from './sync.ts'

let isRunning = false

export default function gitSync() {
    schedule('* * * * *', async() => {
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
    })
}
