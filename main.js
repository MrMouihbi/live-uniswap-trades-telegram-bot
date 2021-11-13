require("dotenv").config();
const contracts = require("./contracts/contracts");
const Web3 = require("web3");
const bot = require("./botController");

const web3 = new Web3(process.env.RPC_WS);

const lp_contract = new web3.eth.Contract(
  contracts.lpToken_abi,
  process.env.PAIR_ADDRESS
);

lp_contract.events
  .Swap({})
  .on("data", function (trade) {
    bot.post(trade);
  })
  .on("error", console.error)
  .on("connected", (subscription_id) =>
    console.log("\nListening to trades ...\n")
  );
