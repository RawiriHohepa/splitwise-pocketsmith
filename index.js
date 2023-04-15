require("dotenv").config();

console.log(process.env.BEARER_TOKEN);
console.log(process.env.USER_ID);
console.log(process.env.DEVELOPER_KEY);

const fetchData = async (url, config) => {
  const response = await fetch(url, config);
  return await response.json();
};

(async () => {
  const splitwiseData = await fetchData(
    "https://secure.splitwise.com/api/v3.0/get_expenses",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
      },
    }
  );

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
