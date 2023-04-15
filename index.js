require("dotenv").config();

console.log(process.env.BEARER_TOKEN);
console.log(process.env.USER_ID);

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
  console.log(data);
})();
