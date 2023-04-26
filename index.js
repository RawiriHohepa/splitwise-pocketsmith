require("dotenv").config();

const fetchData = async (url, config) => {
  const response = await fetch(url, config);
  return await response.json();
};

const mapTransaction = (transaction, splitwiseGroupsObject) => {
  const net_balance = transaction.users.find(
    (u) => "" + u.user_id === process.env.SPLITWISE_USER_ID
  ).net_balance;

  let payee;
  if (transaction.description === "Payment") {
    // Payment to/from FirstName LastName
    const otherUser = transaction.users.find(
      (u) => "" + u.user_id !== process.env.SPLITWISE_USER_ID
    );
    payee = `Payment ${net_balance > 0 ? "to" : "from"} ${
      otherUser.user.first_name || ""
    } ${otherUser.user.last_name || ""}`;
  } else {
    // Description [Group Name]
    payee = `${transaction.description} \[${
      splitwiseGroupsObject[transaction.group_id]
    }\]`;
  }

  // Map splitwise transaction to pocketsmith transaction
  const pocketsmithTransaction = {
    payee,
    amount: net_balance,
    date: transaction.date.split("T")[0],
    note: "" + transaction.id,
    is_transfer: transaction.payment || net_balance > 0,
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

  const transactions = [
    myTransactions[0],
    myTransactions[1],
    myTransactions[2],
    myTransactions[3],
    myTransactions[4],
    myTransactions[5],
  ];

  transactions.forEach(async (transaction) => {
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
      const pocketsmithTransaction = mapTransaction(
        transaction,
        splitwiseGroupsObject
      );

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
  });
})();
