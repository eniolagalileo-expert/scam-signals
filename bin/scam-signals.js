#!/usr/bin/env node
// Usage: scam-signals "message text" [--country US] [--json]
//        echo "message" | scam-signals
import { scanMessage } from "../src/index.js";

const args = process.argv.slice(2);
const json = args.includes("--json");
const ci = args.indexOf("--country");
const country = ci !== -1 ? args[ci + 1] : undefined;
let text = args.filter((a, i) => !a.startsWith("--") && (ci === -1 || i !== ci + 1)).join(" ");

if (!text && !process.stdin.isTTY) {
  for await (const chunk of process.stdin) text += chunk;
}
if (!text.trim()) {
  console.error('Usage: scam-signals "message text" [--country US] [--json]');
  process.exit(2);
}

const r = scanMessage(text, { country });
if (json) {
  console.log(JSON.stringify(r, null, 2));
} else {
  const icon = { scam: "🚨", suspicious: "⚠️ ", likely_safe: "✅" }[r.verdict];
  console.log(`${icon} ${r.verdict.toUpperCase()} (${r.confidence}%)\n\n${r.speech}\n`);
  for (const f of r.red_flags) console.log(`  • ${f.flag}: ${f.evidence}${f.why ? `\n      ${f.why}` : ""}`);
  if (r.report.length) console.log(`\nReport it: ${r.report.map((l) => l.url || l.name).join("  ")}`);
}
process.exit(r.verdict === "scam" ? 1 : 0);
