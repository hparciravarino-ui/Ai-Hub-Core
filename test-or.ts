async function run() {
  const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
    headers: { "Authorization": "Bearer sk-or-v1-fake" }
  });
  console.log(res.status);
  console.log(await res.text());
}
run();
