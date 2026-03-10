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

type UpstashResponse<T> = { result: T } | T[];

async function pipeline<T = unknown>(commands: string[][]): Promise<T[]> {
  if (!baseUrl || !token) throw new Error('UPSTASH_REDIS_REST_URL or TOKEN missing');
  const url = `${baseUrl.replace(/\/+$/, '')}/pipeline`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ commands })
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Upstash error: ${res.status} ${text}`);
  }
  const data: UpstashResponse<T> = await res.json();
  // /pipeline returns an array of results
  if (Array.isArray(data)) return data as T[];
  // some providers may still return single result
  return [((data as { result: T }).result as T)];
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
