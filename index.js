require("dotenv").config();

console.log(process.env.BEARER_TOKEN);
console.log(process.env.USER_ID);

(async () => {
  const response = await fetch(
    "https://secure.splitwise.com/api/v3.0/get_expenses",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
      },
    }
  );
  const jsonData = await response.json();

  console.log(jsonData);
})();
