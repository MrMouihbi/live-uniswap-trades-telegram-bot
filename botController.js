process.env.NTBA_FIX_319 = 1;
const TelegramBot = require("node-telegram-bot-api");
const BigNumber = require("bignumber.js");

const bot = new TelegramBot(process.env.TG_BOT_TOKEN);

async function post(trade) {
  try {
    let amount0In = new BigNumber(trade.returnValues.amount0In).dividedBy(
      10 ** process.env.TOKEN_0_DECIMALS
    );
    let amount1In = new BigNumber(trade.returnValues.amount1In).dividedBy(
      10 ** process.env.TOKEN_1_DECIMALS
    );
    let amount0Out = new BigNumber(trade.returnValues.amount0Out).dividedBy(
      10 ** process.env.TOKEN_0_DECIMALS
    );
    let amount1Out = new BigNumber(trade.returnValues.amount1Out).dividedBy(
      10 ** process.env.TOKEN_1_DECIMALS
    );

    // BUY = true - SELL = false
    let operation = amount0In.isEqualTo("0");

    // Will add a point for each 5 ETH
    let strength = amount0In
      .plus(amount0Out)
      .dividedBy(5)
      .plus(1)
      .integerValue();

    let price = operation
      ? amount1In.dividedBy(amount0Out).toFixed(2)
      : amount1Out.dividedBy(amount0In).toFixed(2);

    let Operation = `${
      operation ? "🚀 Buy Operation 🚀" : "👹 Sell Operation 👹"
    }\n\n`;

    let TradeInfo = `${
      operation
        ? "<b>" +
          amount0Out.toFixed(4) +
          " " +
          process.env.TOKEN_0_NAME +
          " </b> bought for <b>" +
          amount1In.toFixed(2) +
          " " +
          process.env.TOKEN_1_NAME +
          "</b>"
        : "<b>" +
          amount0In.toFixed(4) +
          " " +
          process.env.TOKEN_0_NAME +
          " </b>sold for <b>" +
          amount1Out.toFixed(2) +
          " " +
          process.env.TOKEN_1_NAME +
          "</b>"
    } on ${process.env.DEX_NAME}\n\n`;

    let Strength = () => {
      let s = "";
      for (let i = 1; i <= strength; i++) {
        s += operation ? "🟢" : "🔴";
      }
      s += "\n\n";
      return s;
    };

    let Price = `<b>1 ${process.env.TOKEN_0_NAME} = ${
      price + " " + process.env.TOKEN_1_NAME
    }</b>\n\n`;

    let Links = `🦄 <a href="${process.env.BUY_LINK}"> Buy ${
      process.env.TOKEN_0_NAME
    } </a> | 📶 <a href="${
      process.env.BASE_TX_URL_IN_EXPLORER + trade.transactionHash
    }"> Tx Hash </a> | 📈 <a href="${process.env.CHARTS_LINK}"> Chart </a>\n\n`;

    let Footer = `🚀 Dont Miss Anything with ${process.env.TG_CHANNEL_ID}`;

    let msg = Operation + TradeInfo + Strength() + Price + Links + Footer;

    let channel = await bot.getChat("@price_monitorr");
    await bot.sendMessage(channel.id, msg, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
  } catch (err) {
    console.error(err.message);
  }
}

module.exports = { post };
