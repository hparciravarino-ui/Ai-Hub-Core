import https from "https";
https.get("https://openrouter.ai/api/v1/models", (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    console.log(data.slice(0, 1000));
  });
});
