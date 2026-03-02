// Generates codes like DYK-4A2X
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateAccessCode(): string {
    const part1 = Array.from({ length: 3 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
    const part2 = Array.from({ length: 4 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
    return `${part1}-${part2}`;
}

// SHA-256 hash using Node.js built-in crypto (no extra deps)
export async function hashPassword(password: string): Promise<string> {
    const { createHash } = await import('crypto');
    return createHash('sha256').update(password).digest('hex');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    const inputHash = await hashPassword(password);
    return inputHash === hash;
}
