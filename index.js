require("dotenv").config();

// console.log(process.env.SPLITWISE_BEARER_TOKEN);
// console.log(process.env.SPLITWISE_USER_ID);
// console.log(process.env.POCKETSMITH_DEVELOPER_KEY);
// console.log(process.env.POCKETSMITH_USER_ID);

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
        Authorization: `Bearer ${process.env.SPLITWISE_BEARER_TOKEN}`,
      },
    }
  );
  const data = splitwiseData.expenses.map((expense) => ({
    id: expense.id,
    description: expense.description,
    cost: expense.cost,
    user: expense.users.find(
      (u) => "" + u.user_id === process.env.SPLITWISE_USER_ID
    ),
  }));
  // console.log(data);

  const pocketsmithData = await fetchData(
    `https://api.pocketsmith.com/v2/users/${process.env.POCKETSMITH_USER_ID}/transaction_accounts`,
    {
      method: "GET",
      headers: {
        "X-Developer-Key": process.env.POCKETSMITH_DEVELOPER_KEY,
      },
    }
  );
  console.log(pocketsmithData);
})();
