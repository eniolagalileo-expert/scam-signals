// scam-signals: explainable scam detection for messages, links and phone numbers. No dependencies.
export { scanMessage } from "./scan.js";
export { analyzeUrl, analyzePhone, extractClues, BRANDS, brandName } from "./clues.js";
export { detectLanguage } from "./i18n.js";
export { reportLinks, SUPPORTED_COUNTRIES } from "./report.js";
