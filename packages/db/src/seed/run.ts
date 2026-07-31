import { createSeedData } from "./data.js";

const seed = createSeedData();

console.log("Vortex Optimizer — seed summary");
console.log("================================");
console.log(`Organization: ${seed.organization.name}`);
console.log(`Clients: ${seed.clients.map((c) => c.name).join(", ")}`);
console.log(`Audits: ${seed.audits.length}`);
console.log(`License records (Contoso): ${seed.licenseRecords.length}`);
console.log(`Usage records (Contoso): ${seed.usageRecords.length}`);
console.log(`Findings: ${seed.findings.length}`);
console.log(`Recommendations: ${seed.recommendations.length}`);
console.log("Dashboard KPIs:", seed.dashboard);
