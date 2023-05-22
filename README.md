# splitwise-pocketsmith

A small script to pull Splitwise transactions and import them into Pocketsmith

## Setup and run

1. Create and setup `.env` file (see below)
2. `npm install`
3. `npm start`

## .env file setup

### Splitwise

1. Create a splitwise account
2. [Register a personal app](https://secure.splitwise.com/apps) - *Note: You can just use https://example.com/ for the Homepage URL*
3. Save the keys and secrets given to you
4. Add `SPLITWISE_BEARER_TOKEN` using the API Key given to you
5. Call https://dev.splitwise.com/#tag/users/paths/~1get_current_user/get using your `SPLITWISE_BEARER_TOKEN` as bearer token
6. Add `SPLITWISE_USER_ID` using the `id` field of the response

### Pocketsmith

1. Create a pocketsmith account
2. [Create a developer key](https://developers.pocketsmith.com/docs/introduction#tools-just-for-me) - Settings > Security > Manage developer keys
3. Add `POCKETSMITH_DEVELOPER_KEY` using the developer key you created
4. Call https://developers.pocketsmith.com/reference/get_me-1 using your `POCKETSMITH_DEVELOPER_KEY` as an `X-Developer-Key` header
5. Add `POCKETSMITH_USER_ID` using the `id` field of the response
6. [Create a cash account](https://learn.pocketsmith.com/article/189-dealing-with-cash-transactions) for your splitwise transactions
7. Call https://developers.pocketsmith.com/reference/get_users-id-transaction-accounts-1 using your `POCKETSMITH_DEVELOPER_KEY` as an `X-Developer-Key` header and your `POCKETSMITH_USER_ID` as the path parameter `id`
8. Find your splitwise account in the response and add `POCKETSMITH_TRANSACTION_ACCOUNT_ID` using the `id` field of your splitwise account

#### Optional - Automatically categorise transfers

9. Create a category for transfers
10. Call https://developers.pocketsmith.com/reference/get_users-id-categories-1 using your `POCKETSMITH_DEVELOPER_KEY` as an `X-Developer-Key` header and your `POCKETSMITH_USER_ID` as the path parameter `id`
11. Find your transfers category and add `POCKETSMITH_TRANSFER_CATEGORY_ID` using the `id` field of your transfers category
