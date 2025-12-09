import { spawn } from 'child_process'

export default function run(command: string, args: string[], cwd?: string) {
    return new Promise<void>((resolve, reject) => {
        const child = spawn(command, args, { cwd, stdio: 'inherit' })

        child.on('error', reject)
        child.on('close', (code) => {
            if (code !== 0) reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`))
            else resolve()
        })
    })
}
