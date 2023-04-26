require("dotenv").config();

const fetchData = async (url, config) => {
  const response = await fetch(url, config);
  return await response.json();
};

(async () => {
  // Get all splitwise transactions
  const splitwiseData = await fetchData(
    "https://secure.splitwise.com/api/v3.0/get_expenses",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.SPLITWISE_BEARER_TOKEN}`,
      },
    }
  );
  // Filter to just transactions I am involved in
  const myExpenses = splitwiseData.expenses.filter(
    (expense) =>
      !!expense.users.find(
        (u) => "" + u.user_id === process.env.SPLITWISE_USER_ID
      )
  );

  // Get all splitwise groups
  const splitwiseGroupsArray = await fetchData(
    "https://secure.splitwise.com/api/v3.0/get_groups",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.SPLITWISE_BEARER_TOKEN}`,
      },
    }
  );
  // Create map between group id and name
  const splitwiseGroupsObject = {};
  splitwiseGroupsArray.groups.forEach((group) => {
    splitwiseGroupsObject[group.id] = group.name;
  });

  const expense = myExpenses[0];

  // Check if pocketsmith has an existing transaction for the splitwise transaction
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
    // Map splitwise transaction to pocketsmith transaction
    const pocketsmithTransaction = {
      payee: `${expense.description} \[${
        splitwiseGroupsObject[expense.group_id]
      }\]`, // "(expense.group_name)"
      amount: expense.users[1].net_balance,
      date: expense.date.split("T")[0],
      note: "" + expense.id,
      is_transfer: expense.payment,
    };

    // Create pocketsmith transaction
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
    // Pocketsmith transaction already exists, do nothing
    console.log(existingTransaction);
  }
})();
