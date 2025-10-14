import { schedule } from "node-cron"
import sync from './sync.ts'

export default function gitSync() {
    schedule('* * * * *', async() => {
        sync()
    })
}
