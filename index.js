const {
  Client,
  TokenCreateTransaction,
  PrivateKey,
  AccountId,
  Hbar
} = require("@hashgraph/sdk");

require("dotenv").config();

// Get operator from .env file
const treasuryKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
const treasuryId = AccountId.fromString(process.env.OPERATOR_ID);

const client = Client.forMainnet().setOperator(treasuryId, treasuryKey);


const main = async () => {

  //Create the transaction and freeze for manual signing
  const transaction = await new TokenCreateTransaction()
    .setTokenName("TEST COIN")
    .setTokenSymbol("TEST")
    .setTreasuryAccountId(treasuryId)
    .setInitialSupply(100000000000)
    .setDecimals(2)
    .setAutoRenewAccountId(treasuryId)
    .setAutoRenewPeriod(7000000)
    .setMaxTransactionFee(new Hbar(30)) //Change the default max transaction fee
    .freezeWith(client);

  //Sign the transaction with the token adminKey and the token treasury account private key
  const signTx = await transaction.sign(treasuryKey);

  //Sign the transaction with the client operator private key and submit to a Hedera network
  const txResponse = await signTx.execute(client);

  //Get the receipt of the transaction
  const receipt = await txResponse.getReceipt(client);

  //Get the token ID from the receipt
  const tokenId = receipt.tokenId;

  console.log("The new token ID is " + tokenId);
};

main();
