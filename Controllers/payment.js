const paypal = require("../helpers/paypal");
const arr = [1, 2, 334, 343];

const createPayment = async (req, res) => {
  const paymentDetailsJson = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "localhost:3000",
      cancel_url: "localhost:3000/home",
    },
    transactions: [
      {
        item_list: {
          items: req.body.items.map((item) => {
            return {
              name: item.name,
              sku: item.id,
              price: item.price,
              currency: "USD",
              quantity: item.quantity,
            };
          }),
        },
        amount: {
          total: req.body.amount,
          currency: "USD",
        },
        description: "this is description",
      },
    ],
  };
};
