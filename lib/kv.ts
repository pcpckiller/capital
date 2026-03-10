const baseUrl =
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REST_URL ||
  undefined;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REST_TOKEN ||
  undefined;

type UpstashResult<T> = { result: T } | T;

async function pipeline<T = unknown>(commands: string[][]): Promise<T[]> {
  if (!baseUrl || !token) throw new Error('UPSTASH_REDIS_REST_URL or TOKEN missing');
  const url = `${baseUrl.replace(/\/+$/, '')}/pipeline`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    // Upstash/Vercel KV expect a raw JSON array of command arrays
    body: JSON.stringify(commands)
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Upstash error: ${res.status} ${text}`);
  }
  const data = (await res.json()) as Array<UpstashResult<T>>;
  if (Array.isArray(data)) {
    return data.map((item) => {
      const obj = item as unknown as Record<string, unknown>;
      return obj && typeof obj === 'object' && 'result' in obj
        ? (obj.result as T)
        : (item as T);
    });
  }
  // Fallback: some providers may return single object
  const obj = (data as unknown) as Record<string, unknown>;
  const single =
    obj && typeof obj === 'object' && 'result' in obj ? (obj.result as T) : ((data as unknown) as T);
  return [single];
}

export const kv = {
  enabled: Boolean(baseUrl && token),
  async hgetall(key: string): Promise<Record<string, string> | null> {
    const [result] = (await pipeline<string[] | null>([['HGETALL', key]])) as (string[] | null)[];
    if (!result || result.length === 0) return null;
    const obj: Record<string, string> = {};
    for (let i = 0; i < result.length; i += 2) obj[result[i]] = result[i + 1];
    return obj;
  },
  async hget(key: string, field: string): Promise<string | null> {
    const [result] = (await pipeline<string | null>([['HGET', key, field]])) as (string | null)[];
    return result ?? null;
  },
  async hmset(key: string, map: Record<string, string>) {
    const args: string[] = [];
    for (const [k, v] of Object.entries(map)) {
      if (v !== undefined && v !== null) {
        args.push(k, String(v));
      }
    }
    await pipeline([['HSET', key, ...args]]);
  },
  async sadd(key: string, member: string) {
    await pipeline([['SADD', key, member]]);
  },
  async srem(key: string, member: string) {
    await pipeline([['SREM', key, member]]);
  },
  async smembers(key: string): Promise<string[]> {
    const [result] = (await pipeline<string[] | null>([['SMEMBERS', key]])) as (string[] | null)[];
    return result ?? [];
  }
};
