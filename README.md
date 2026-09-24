# scam-signals

Explainable, **dependency-free** scam detection for text messages, emails, DMs, call transcripts, links and phone numbers, with a **short summary written to be read aloud**.

```bash
$ npx scam-signals "USPS: unpaid \$1.99 redelivery fee. Pay within 24 hours: https://usps.com-track-redelivery.top/pkg"
🚨 SCAM (97%)

This looks like a scam. The link pretends to be a real company but goes to a different website,
and it asks for a small fee to release a package, prize or loan. Don't click the link, don't call back,
and don't pay or share anything.

  • Fake or disguised link: https://usps.com-track-redelivery.top/pkg
      Mentions "usps" but the real site is com-track-redelivery.top, not usps.com
  • Asks for a small fee to release something: redelivery fee
  • Pressure to act fast: within 24 hours
```

It's the detection engine behind [ScamShield for Alexa+](https://github.com/eniolagalileo-expert/scamshield-alexa), extracted so anyone can use it: in a chatbot, an email filter, a browser extension, an SMS gateway, or a voice assistant.

## Why
- **Explainable:** every verdict comes with the exact red flags and the evidence quoted from the message.
- **Voice-ready:** `speech` is one or two plain sentences, with the strongest reasons first, meant for older adults and screen readers.
- **Safe:** it never opens, fetches or clicks links. Links are analyzed as text.
- **Tiny:** no dependencies, works offline, instant.
- **Multilingual:** detection keywords in English, Spanish, Hindi and Indonesian; spoken answers in Spanish (full), Hindi and Indonesian (verdict + action).

## What it detects
20+ tactics, including:
- Look-alike and disguised links: `paypa1`, `arnazon`, `rnicrosoft`, `apple.com.secure-verify.info`, punycode, raw IPs, shorteners, risky TLDs.
- Phone numbers that don't match the claimed sender ("USPS" texting from abroad), and premium-rate numbers.
- Gift-card, crypto and wire payment requests; "small fee to release" scams; payment-app requests.
- Requests for one-time codes, passwords and account details (not mere mentions, like a password-reset notice).
- Pressure, real threats (arrest, lawsuits), secrecy ("don't tell anyone"), "Hi Mum, new number", emergency-money stories.
- Overpayment and "sent you money by mistake", fake tech support, "safe account", robocalls, fake renewals and "call to cancel" charges, job-equipment checks, romance and investment lures.
- Protective wording that genuine services use ("never share this code", "open the app") lowers the score.

## API

```js
import { scanMessage, analyzeUrl, analyzePhone, reportLinks } from "scam-signals";

const r = scanMessage("Chase: your account is locked. Verify your identity at http://chase-secure-verify.online", { country: "US" });
r.verdict;     // "scam" | "suspicious" | "likely_safe"
r.confidence;  // heuristic 0-100 (not a probability)
r.speech;      // "This looks like a scam. ..."
r.language;    // "en" | "es" | "hi" | "id"
r.red_flags;   // [{ flag, evidence, why? }]
r.links;       // per-link analysis
r.phones;      // per-number analysis
r.what_to_do;  // plain-language next steps
r.report;      // official reporting links for the country (US, GB, IN, CA, AU)

analyzeUrl("http://paypa1-secure.com/login");
// { risk: "high", domain: "paypa1-secure.com", flags: ['Looks like "paypal.com" but is actually paypa1-secure.com (look-alike domain)', ...] }

analyzePhone("+234 803 555 0199", ["usps"]);
// { risk: "high", country: "Nigeria", flags: ["Claims to be USPS (a US organization) but the number is from Nigeria"] }
```

### CLI
```bash
scam-signals "message text" [--country US] [--json]
echo "message text" | scam-signals
```
The exit code is `1` for a scam and `0` otherwise, handy in scripts and mail filters.

## Accuracy (honest numbers)
`npm run bench` runs four labeled sets:

| Set | Accuracy | Scams caught | False alarms |
|---|---|---|---|
| Dev sets A, B, C (100 msgs, used while designing the rules) | 100% | 66/66 | 0/34 |
| **Held-out test v2 (37 msgs, written after all tuning, never tuned on)** | **86%** | **17/22** | **0/15** |

It is tuned to avoid false alarms, and it misses some new scam wordings (see `eval/RESULTS.md`). Treat it as a strong first layer and an explainer, not a guarantee. In ScamShield it's combined with official-source checks and an AI assistant's own judgment.

## Development
```bash
npm test       # unit tests + CLI tests
npm run bench  # accuracy on the labeled sets
```
The rules live in `src/scan.js` (tactics) and `src/clues.js` (links and phones). When you add a rule, add examples to a dev set, and write *new* held-out examples to measure it honestly.

## License
MIT
