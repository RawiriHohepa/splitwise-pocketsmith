require("dotenv").config();

console.log(process.env.BEARER_TOKEN);
console.log(process.env.USER_ID);

(async () => {
  const response = await fetch(
    "https://gist.githubusercontent.com/sunilshenoy/23a3e7132c27d62599ba741bce13056a/raw/517b07fc382c843dcc7d444046d959a318695245/sample_json.json"
  );
  const jsonData = await response.json();
  console.log(jsonData);
})();
