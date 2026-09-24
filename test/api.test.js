import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { analyzePhone, analyzeUrl, detectLanguage, normalizeSpokenLinks, reportLinks, scanMessage } from "../src/index.js";

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

test("links read aloud (English and Spanish) are rebuilt and checked", () => {
  assert.equal(normalizeSpokenLinks("pay at usps dot com dash track dash redelivery dot top slash pkg today"), "pay at usps.com-track-redelivery.top/pkg today");
  assert.equal(normalizeSpokenLinks("pague en usps punto com guion entrega punto top barra pkg hoy"), "pague en usps.com-entrega.top/pkg hoy");
  assert.equal(normalizeSpokenLinks("I will dot the i and we can talk later"), "I will dot the i and we can talk later");
  assert.equal(normalizeSpokenLinks("a las tres en punto me llamó"), "a las tres en punto me llamó");
  const r = scanMessage("USPS your package is on hold pay the redelivery fee at usps dot com dash track dash redelivery dot top slash pkg");
  assert.equal(r.verdict, "scam");
});

test("speak option answers in the listener's language", () => {
  const r = scanMessage("USPS: pay the $1.99 redelivery fee within 24 hours at usps.com-track-redelivery.top", { speak: "es" });
  assert.equal(r.language, "en");
  assert.match(r.speech, /^Esto parece una estafa\./);
});
