import fetch from 'node-fetch';
async function test() {
    const res = await fetch('https://openrouter.ai/api/v1/models');
    const data = await res.json();
    const freeModels = data.data.filter(m => m.pricing && m.pricing.prompt === "0" && m.id.includes("gemini"));
    console.log(freeModels.map(m => m.id));
}
test();
