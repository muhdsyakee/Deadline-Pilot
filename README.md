# Deadline Pilot

**Your AI co-pilot for university deadlines.**

Deadline Pilot is an AI-powered task assistant built for university students. Instead of juggling assignments, quizzes, and project deadlines across memory, messages, and sticky notes, students add their tasks into Deadline Pilot — and the app tells them exactly what to focus on right now.

When a task is marked complete, it's permanently logged on-chain to the student's wallet, creating a verifiable, tamper-proof record of academic productivity over time.

---

# The problem

University students constantly ask themselves: *"What should I actually work on today?"* Deadlines are scattered, priorities are unclear, and it's easy to lose track of what matters most in the moment.

# What Deadline Pilot does

- **Add tasks** — name, deadline, and estimated hours needed
- **Get an AI recommendation** — an AI call analyzes your open tasks and tells you the single best thing to focus on right now, with a reason why (falls back to a rule-based priority calculation if the AI is temporarily unavailable, so the app never breaks)
- **Start a focus session** — a built-in countdown timer sized to the recommended task
- **See a calendar view** — tasks plotted on a monthly calendar so you can plan ahead
- **Get notified** — an in-app banner (and optional browser notification) flags tasks due today or within the next 7 days
- **Mark tasks done** — completing a task writes a permanent record to the blockchain, tied to your wallet address

# How someone would use it

1. Open the live site and click **Connect wallet** (MetaMask required, on BOT Chain Testnet)
2. Click **+ Add task**, enter a task name, deadline, and estimated hours
3. The **"Right now"** panel updates with an AI-generated recommendation
4. Click **Start focus session** to run a timer for that task
5. Once finished (or anytime), click **Mark done** — this triggers a MetaMask transaction that permanently logs the completed task on-chain
6. Check the bottom of the app to see your running count of on-chain completed tasks

# How it's built

- **Frontend:** a single self-contained `index.html` file — no framework, no build step. Uses `ethers.js` to talk to MetaMask and the smart contract.
- **AI:** task prioritization is powered by a real call to Anthropic's Claude API, proxied through a Cloudflare Worker (`worker.js`) so the API key is never exposed in the browser. If the AI call fails for any reason, the app automatically falls back to a rule-based prioritization (nearest deadline, weighted by effort) so the core experience never breaks.
- **Smart contract:** `TaskLog.sol`, a Solidity contract deployed on BOT Chain. Each wallet has its own on-chain list of completed tasks (name + timestamp). No documents or AI processing ever touch the chain — only the final "task completed" record.

# Smart contract functions

| Function | What it does |
|---|---|
| `completeTask(string taskName)` | Logs a completed task for the caller's wallet, with a timestamp |
| `getTaskCount(address student)` | Returns how many tasks a wallet has completed |
| `getTask(address student, uint256 index)` | Returns one specific completed task by index |
| `getAllTasks(address student)` | Returns a wallet's full list of completed tasks |

# Deployment

**Testnet contract address:** `0x697C4460302b9Bed7343df09b84b1868217ACE08`

**Mainnet contract address:** `0x697C4460302b9Bed7343df09b84b1868217ACE08`

# Tech stack

- Solidity (`^0.8.20`)
- Remix IDE for compiling and deploying
- BOT Chain (EVM-compatible testnet/mainnet)
- MetaMask for wallet connection
- `ethers.js` for contract interaction
- Anthropic Claude API for AI task prioritization
- Cloudflare Workers for the secure AI proxy