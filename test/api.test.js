import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { analyzePhone, analyzeUrl, detectLanguage, reportLinks, scanMessage } from "../src/index.js";

test("public API is exported", () => {
  assert.equal(typeof scanMessage, "function");
  assert.equal(analyzeUrl("https://arnazon.com").risk, "high");
  assert.equal(analyzePhone("+234 803 555 0199", ["usps"]).risk, "high");
  assert.equal(detectLanguage("Su paquete está retenido, pague hoy para su entrega"), "es");
  assert.ok(reportLinks("US").length > 0);
});

test("CLI prints a verdict and exits 1 for scams, 0 otherwise", () => {
  const bin = new URL("../bin/scam-signals.js", import.meta.url).pathname;
  let code = 0;
  let out = "";
  try { execFileSync(process.execPath, [bin, "Pay the $1.99 fee within 24 hours: https://usps.com-track-redelivery.top/pkg"]); }
  catch (err) { code = err.status; out = String(err.stdout); }
  assert.equal(code, 1);
  assert.match(out, /SCAM/);
  const safe = execFileSync(process.execPath, [bin, "Your Uber code is 4821. Never share this code with anyone."]).toString();
  assert.match(safe, /LIKELY_SAFE/);
  const json = JSON.parse(execFileSync(process.execPath, [bin, "--json", "hi, are we still on for dinner?"]).toString());
  assert.equal(json.verdict, "likely_safe");
});
