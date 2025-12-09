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

export function runCapture(command: string, args: string[], cwd?: string) {
    return new Promise<string>((resolve, reject) => {
        const child = spawn(command, args, { cwd })
        let output = ''

        child.stdout.on('data', d => output += d)
        child.stderr.on('data', d => output += d)

        child.on('error', reject)
        child.on('close', code => {
            if (code !== 0) reject(new Error(output))
            else resolve(output)
        })
    })
}
