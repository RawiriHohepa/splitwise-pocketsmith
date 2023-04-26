require("dotenv").config();

const fetchData = async (url, config) => {
  const response = await fetch(url, config);
  return await response.json();
};

const mapTransaction = (transaction) => {
  const user = transaction.users.find(
    (u) => "" + u.user_id === process.env.SPLITWISE_USER_ID
  );

  // Map splitwise transaction to pocketsmith transaction
  const pocketsmithTransaction = {
    payee: `${transaction.description} \[${
      splitwiseGroupsObject[transaction.group_id]
    }\]`, // "(expense.group_name)"
    amount: user.net_balance,
    date: transaction.date.split("T")[0],
    note: "" + transaction.id,
    is_transfer: transaction.payment || user.net_balance > 0,
  };
  return pocketsmithTransaction;
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
  const myTransactions = splitwiseData.expenses.filter(
    (expense) =>
      !!expense.users.find(
        (user) => "" + user.user_id === process.env.SPLITWISE_USER_ID
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

  const transaction = myTransactions[0];

  // Check if pocketsmith has an existing transaction for the splitwise transaction
  const existingTransaction = await fetchData(
    `https://api.pocketsmith.com/v2/transaction_accounts/${process.env.POCKETSMITH_TRANSACTION_ACCOUNT_ID}/transactions?search=${transaction.id}`,
    {
      method: "GET",
      headers: {
        "X-Developer-Key": process.env.POCKETSMITH_DEVELOPER_KEY,
      },
    }
  );
  if (!existingTransaction.length) {
    const pocketsmithTransaction = mapTransaction(transaction);

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
