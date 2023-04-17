require("dotenv").config();

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
  const myExpenses = splitwiseData.expenses.filter(
    (expense) =>
      !!expense.users.find(
        (u) => "" + u.user_id === process.env.SPLITWISE_USER_ID
      )
  );
  // console.log(myExpenses[1]);

  const expense = myExpenses[1];
  const pocketsmithTransaction = {
    payee: expense.description,
    amount: expense.users[1].net_balance,
    date: expense.date.split("T")[0],
    note: "" + expense.id,
    is_transfer: expense.payment,
  };
  // console.log(pocketsmithTransaction);

  const existingTransaction = await fetchData(
    `https://api.pocketsmith.com/v2/transaction_accounts/${process.env.POCKETSMITH_TRANSACTION_ACCOUNT_ID}/transactions?search=${expense.id}`,
    {
      method: "GET",
      headers: {
        "X-Developer-Key": process.env.POCKETSMITH_DEVELOPER_KEY,
      },
    }
  );
  if (!existingTransaction.length) {
    const pocketsmithResponse = await fetchData(
      `https://api.pocketsmith.com/v2/transaction_accounts/${process.env.POCKETSMITH_TRANSACTION_ACCOUNT_ID}/transactions`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "X-Developer-Key": process.env.POCKETSMITH_DEVELOPER_KEY,
        },
        body: JSON.stringify(pocketsmithTransaction),
      }
    );
    console.log(pocketsmithResponse);
  } else {
    console.log(existingTransaction);
  }
})();
