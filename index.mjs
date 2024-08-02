import express from 'express';
import { PublicKey, Connection, clusterApiUrl } from '@solana/web3.js';
import fetch from 'node-fetch'; // Make sure to install node-fetch
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = 3000;

const walletAddress = "4UYjrT5hmMTh9pLFg1Mxh49besnAeCc23qFoZc6WnQkK";
const connection = new Connection(clusterApiUrl("mainnet-beta"));
let tokenList = [];

// Fetch the Solana token list
async function fetchTokenList() {
    const response = await fetch('https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json');
    const tokenListJson = await response.json();
    tokenList = tokenListJson.tokens;
}

function getTokenMetadata(mint) {
    return tokenList.find(token => token.address === mint) || {};
}

async function getTransactionsOfUser(address, connection, limit) {
    try {
        const publicKey = new PublicKey(address);
        const transactions = [];
        let beforeString = null;
        
        while (transactions.length < limit) {
            const options = { limit: 10, before: beforeString }; // Fetch in batches of 10
            const transSignatures = await connection.getSignaturesForAddress(publicKey, options);
            if (transSignatures.length === 0) break; // Exit if no more transactions are found

            for (const transSignature of transSignatures) {
                const confirmedTransaction = await connection.getConfirmedTransaction(transSignature.signature);
                if (confirmedTransaction) {
                    const { meta, blockTime } = confirmedTransaction;
                    if (meta) {
                        const oldBalance = meta.preBalances[0];
                        const newBalance = meta.postBalances[0];
                        const amount = (oldBalance - newBalance);
                        const tokenAccountIndex = meta.postTokenBalances.findIndex((balance) => balance.owner === address);
                        const tokenAccount = tokenAccountIndex !== -1 ? meta.postTokenBalances[tokenAccountIndex] : null;

                        if (tokenAccount) { // Only include transactions with token information
                            const tokenMetadata = getTokenMetadata(tokenAccount.mint);
                            const transWithSignature = {
                                uuid: uuidv4(),
                                network: "Solana",
                                fee: meta.fee,
                                compute_units_consumed: meta.computeUnitsConsumed || 0,
                                timestamp: blockTime ? new Date(blockTime * 1000).toISOString() : null,
                                type: amount < 0 ? "send_token" : "receive_token",
                                wallet_address: address,
                                transaction_hash: transSignature.signature,
                                metadata: {
                                    amount: amount.toString()
                                },
                                token: {
                                    uuid: uuidv4(),
                                    network: "Solana",
                                    contract_address: tokenAccount.mint,
                                    name: tokenMetadata.name || "Unknown Token",
                                    symbol: tokenMetadata.symbol || "UNKNOWN",
                                    decimals: tokenMetadata.decimals || tokenAccount.uiTokenAmount.decimals,
                                    display_decimals: tokenMetadata.display_decimals || 2,
                                    logo_url: tokenMetadata.logoURI || ""
                                },
                                explorer_url: `https://solscan.io/tx/${transSignature.signature}?cluster=mainnet-beta`
                            };

                            transactions.push(transWithSignature);
                            if (transactions.length >= limit) break;
                        }
                    }
                }
            }

            beforeString = transSignatures[transSignatures.length - 1].signature; // Update to the last signature
        }

        return { status: "success", message: "Activity retrieved successfully", data: transactions };
    } catch (err) {
        console.error('Error in getTransactionsOfUser:', err);
        return { status: "error", message: "Error retrieving activity", data: [] };
    }
}

app.get('/transactions', async (req, res) => {
    try {
        await fetchTokenList();
        const response = await getTransactionsOfUser(walletAddress, connection, 5);
        res.json(response);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            status: "error",
            message: "Error fetching transactions",
            data: []
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
