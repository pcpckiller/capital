const url =
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REST_URL ||
  undefined;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REST_TOKEN ||
  undefined;

type UpstashResponse<T> = { result: T };

async function send<T = unknown>(command: string[], parseJson = true): Promise<T> {
  if (!url || !token) throw new Error('UPSTASH_REDIS_REST_URL or TOKEN missing');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ command })
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Upstash error: ${res.status} ${text}`);
  }
  const data: UpstashResponse<T> = await res.json();
  return parseJson ? data.result : (data as unknown as T);
}

export const kv = {
  enabled: Boolean(url && token),
  async hgetall(key: string): Promise<Record<string, string> | null> {
    const result = (await send(['HGETALL', key])) as string[] | null;
    if (!result || result.length === 0) return null;
    const obj: Record<string, string> = {};
    for (let i = 0; i < result.length; i += 2) obj[result[i]] = result[i + 1];
    return obj;
  },
  async hmset(key: string, map: Record<string, string>) {
    const args: string[] = [];
    for (const [k, v] of Object.entries(map)) {
      if (v !== undefined && v !== null) {
        args.push(k, String(v));
      }
    }
    await send(['HSET', key, ...args]);
  },
  async sadd(key: string, member: string) {
    await send(['SADD', key, member]);
  },
  async srem(key: string, member: string) {
    await send(['SREM', key, member]);
  },
  async smembers(key: string): Promise<string[]> {
    const result = (await send(['SMEMBERS', key])) as string[] | null;
    return result ?? [];
  }
};
