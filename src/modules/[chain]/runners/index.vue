<template>
  <div class="airdrop-container">
    <div class="explanation">
      <h2>Runner Airdrop</h2>
      <p>To join the Runner Operator waitlist and become eligible for the Runner Airdrop, you need to send a transaction. This transaction will help us identify your public Soarchain wallet address. In this transaction, 0.03 tSOAR tokens should be sent to the wallet address soar1e885q0rvvh84gd4gkvcw0qpd7cldavkfakjqty. This is to verify your created address. The button below automates the token sending transaction for you.</p>
      <p>Here's a simplified guide:</p>
      <ol>
        <li>1. Ensure you've created your Soarchain wallet via the Soarchain Connect Mobile App and have your 24-word recovery phrase ready.</li>
        <li>2. Download the Keplr Wallet extension for your browser (<a href="https://www.keplr.app/">https://www.keplr.app/</a>).</li>
        <li>3. Add your Soarchain wallet to your Keplr wallet using the 24-word recovery phrase of your Soarchain wallet.</li>
        <li>4. Click the "Send the Transaction" button.</li>
        <li>5. If Soarchain isn't enabled in your Keplr wallet, the Soarchain Explorer will prompt you to enable it. Please click "Approve" in the popup.</li>
        <li>6. Complete the transaction from the Keplr Wallet popup.</li>
      </ol>
    </div>
    <button class="airdrop-button" @click="sendTransaction" :disabled="loading">
      Send the Transaction
    </button>
    <div v-if="loading" class="loading-box">
      <p>Processing transaction, please wait...</p>
    </div>
    <div v-if="transactionStatus" class="message-box">
      <p>{{ transactionStatus }}</p>
      <p v-if="txHash">Transaction Hash: {{ txHash }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { SigningStargateClient } from '@cosmjs/stargate';

const isEligible = ref(false);
const transactionStatus = ref('');
const loading = ref(false);
const txHash = ref('');

const sendTransaction = async () => {
  console.log("Button clicked, initiating transaction...");
  loading.value = true;
  transactionStatus.value = '';
  txHash.value = '';

  // Check if the Keplr extension is installed
  if ((window as any).keplr) {
    console.log("Keplr extension found.");

    try {
      const chainId = "soarchaintestnet";
      const keplr = (window as any).keplr;

      // Check if the chain is already enabled in Keplr
      try {
        await keplr.enable(chainId);
        console.log("Keplr enabled for soarchain.");
      } catch {
        console.log("Chain not found in Keplr, adding chain info.");
        // Add chain info to Keplr
        await keplr.experimentalSuggestChain({
          chainId: "soarchaintestnet",
          chainName: "Soarchain",
          rpc: "https://rpc1.testnet.soarchain.com",
          rest: "https://rpc1.testnet.soarchain.com/api",
          bip44: {
            coinType: 118,
          },
          bech32Config: {
            bech32PrefixAccAddr: "soar",
            bech32PrefixAccPub: "soar" + "pub",
            bech32PrefixValAddr: "soar" + "valoper",
            bech32PrefixValPub: "soar" + "valoperpub",
            bech32PrefixConsAddr: "soar" + "valcons",
            bech32PrefixConsPub: "soar" + "valconspub",
          },
          currencies: [
            {
              coinDenom: "TSOAR",
              coinMinimalDenom: "utsoar",
              coinDecimals: 6,
            },
          ],
          feeCurrencies: [
            {
              coinDenom: "TSOAR",
              coinMinimalDenom: "utsoar",
              coinDecimals: 6,
            },
          ],
          stakeCurrency: {
            coinDenom: "TSOAR",
            coinMinimalDenom: "utsoar",
            coinDecimals: 6,
          },
          coinType: 118,
          gasPriceStep: {
            low: 0.001,
            average: 0.002,
            high: 0.04,
          },
        });

        console.log("Chain info added to Keplr.");

        // Enable the chain after adding it
        await keplr.enable(chainId);
        console.log("Keplr enabled for soarchain.");
      }

      // Get the sender's address
      const offlineSigner = keplr.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();
      const sender = accounts[0].address;

      console.log("Sender address:", sender);

      // Create a SigningStargateClient
      const client = await SigningStargateClient.connectWithSigner(
        "https://rpc1.testnet.soarchain.com",
        offlineSigner
      );

      // Define the transaction message for bank send
      const msg = {
        fromAddress: sender,
        toAddress: "soar1e885q0rvvh84gd4gkvcw0qpd7cldavkfakjqty",
        amount: [
          {
            denom: "utsoar",
            amount: "30000",
          },
        ],
      };

      console.log("Transaction message:", msg);

      // Define the fee
      const fee = {
        amount: [{ denom: "utsoar", amount: "50" }],
        gas: "200000",
      };

      console.log("Transaction fee:", fee);

      // Send tokens
      const result = await client.sendTokens(sender, msg.toAddress, msg.amount, fee, "Runner Operator Airdrop");

      console.log("Broadcast result:", result);

      // Check if the result is successful
      if (result && result.code === 0) {
        isEligible.value = true;
        transactionStatus.value = `Wallet address ${sender} was successfully joined the Runner Operator wait list.`;
        txHash.value = result.transactionHash;
      } else {
        transactionStatus.value = 'Transaction failed, please try again.';
      }
    } catch (error) {
      console.error("Error during transaction process:", error);
      if (error instanceof Error && error.message.includes("does not exist on chain")) {
        transactionStatus.value = 'Account does not exist on chain. Please download the SoarchainConnect mobile app to claim your testnet coins.';
      } else {
        transactionStatus.value = 'Transaction failed, please try again.';
      }
    } finally {
      loading.value = false;
    }
  } else {
    console.log("Please install the Keplr extension.");
    transactionStatus.value = 'Please install the Keplr extension.';
    loading.value = false;
  }
};
</script>

<style scoped>
.airdrop-container {
  max-width: 700px;
  margin: 0 auto;
  text-align: left; 
  padding: 20px;
  border: 1px solid #4f0855;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #633aa5;
  color: #f8f9fa;
}

.explanation h2 {
  text-align: center;
}

.airdrop-button {
  padding: 15px 25px;
  font-size: 16px;
  color: #000;
  background-color: #00EF92;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: block;
  margin: 20px auto;
}

.airdrop-button:disabled {
  background-color: #999;
  cursor: not-allowed;
}

.airdrop-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.loading-box, .message-box {
  margin-top: 30px;
  padding: 10px;
  border: 1px solid #000;
  border-radius: 5px;
  background-color: #f8f9fa;
  color: #333;
}
</style>

<route>
{
  meta: {
    i18n: 'runners'
  }
}
</route>
