local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refillRate = tonumber(ARGV[2])
local cost = tonumber(ARGV[3])

local time = redis.call('TIME')
local nowMs = tonumber(time[1]) * 1000 + math.floor(tonumber(time[2]) / 1000)
local bucket = redis.call('HMGET', key, 'tokens', 'timestamp')
local tokens = tonumber(bucket[1]) or capacity
local lastRefillMs = tonumber(bucket[2]) or nowMs

local elapsedMs = math.max(0, nowMs - lastRefillMs)
tokens = math.min(capacity, tokens + elapsedMs * refillRate / 1000)

local allowed = 0
local retryAfterMs = 0

if tokens >= cost then
    tokens = tokens - cost
    allowed = 1
else
    retryAfterMs = math.ceil((cost - tokens) / refillRate * 1000)
end

redis.call('HSET', key, 'tokens', tokens, 'timestamp', nowMs)
redis.call('PEXPIRE', key, math.ceil(capacity / refillRate * 1000))

return { allowed, math.floor(tokens), retryAfterMs }