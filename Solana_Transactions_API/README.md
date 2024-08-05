# Solana Transactions API

This is a Node.js application using Express to retrieve and serve transaction data from the Solana blockchain. It fetches token metadata and transactions for a specific wallet address on the Solana mainnet-beta cluster.

## Features

- Fetches transaction data for a specified wallet address.
- Retrieves token metadata including name, symbol, and logo from Solana's token list.
- Provides an API endpoint to get the last few transactions, including details about token transfers.

## Setup and Installation

1. **Clone the Repository**

   ```sh
   git clone https://github.com/TishaRepo/Blockchain.git
   cd Blockchain
   ```

2. **Install Dependencies**

   Ensure you have `node` and `npm` installed. Install the required packages using:

   ```sh
   npm install
   ```

3. **Configuration**

   - Update the `walletAddress` variable in `index.js` with the desired Solana wallet address.
   - Ensure the remote token list URL in `fetchTokenList` function is up-to-date.

4. **Run the Application**

   Start the server with:

   ```sh
   npm start
   ```

   The server will start on `http://localhost:3000/transactions`.

## API Endpoints

### `GET /transactions`

Retrieves the latest transactions for the specified wallet address. It includes transaction details such as:

- Transaction hash
- Transaction type (send or receive token)
- Token metadata (name, symbol, logo URL)
- Amount and fees
- Explorer URL

**Response Example:**

```json
{
  "status": "success",
  "message": "Activity retrieved successfully",
  "data": [
    {
      "uuid": "some-uuid",
      "network": "Solana",
      "fee": 5000,
      "compute_units_consumed": 200,
      "timestamp": "2024-08-02T12:00:00Z",
      "type": "send_token",
      "wallet_address": "4UYjrT5hmMTh9pLFg1Mxh49besnAeCc23qFoZc6WnQkK",
      "transaction_hash": "transaction-signature",
      "metadata": {
        "amount": "1000"
      },
      "token": {
        "uuid": "token-uuid",
        "network": "Solana",
        "contract_address": "token-mint-address",
        "name": "Token Name",
        "symbol": "TOKEN",
        "decimals": 6,
        "display_decimals": 2,
        "logo_url": "https://example.com/logo.png"
      },
      "explorer_url": "https://solscan.io/tx/transaction-signature?cluster=mainnet-beta"
    }
  ]
}
```

## Dependencies

- `express`: Web framework for Node.js
- `@solana/web3.js`: Solana Web3 library
- `node-fetch`: Fetch API for Node.js
- `uuid`: UUID generation

## Error Handling

In case of errors, we get the status as "error" with a message.

## Note

Node version - v20.10.0

