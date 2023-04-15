require("dotenv").config();

console.log(process.env.BEARER_TOKEN);
console.log(process.env.USER_ID);
console.log(process.env.DEVELOPER_KEY);

(async () => {
  const response = await fetch(
    "https://secure.splitwise.com/api/v3.0/get_expenses", //?limit=0",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
      },
    }
  );
  const jsonData = await response.json();

  const data = jsonData.expenses.map((expense) => ({
    id: expense.id,
    description: expense.description,
    cost: expense.cost,
    user: expense.users.find((u) => "" + u.user_id === process.env.USER_ID),
  }));
  // console.log(data);

  const response2 = await fetch("https://api.pocketsmith.com/v2/me", {
    method: "GET",
    headers: {
      "X-Developer-Key": process.env.DEVELOPER_KEY,
    },
  });
  const jsonData2 = await response2.json();
  console.log(jsonData2);
})();
