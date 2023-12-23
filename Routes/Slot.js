const Slot = require("../Model/Slot");
const router = require("express").Router();
const Razorpay = require("razorpay")
const crypto = require('crypto');

// Get all available slots
router.get("/slot", async (req, res) => {
  try {
    const { date } = req.query;
    const currentDate = date.split("-");

    const day = parseInt(currentDate[0]);
    const month = parseInt(currentDate[1]) - 1;
    const year = parseInt(currentDate[2]);

    const slotDate = new Date(Date.UTC(year, month, day));

    const slots = await Slot.find({ date: slotDate });
    res.status(200).json({ slots });
  } catch (error) {
    console.error("Error getting slots:", error);
    res.status(500).json({ message: "An error occurred while getting slots." });
  }
});

// Book a slot
router.post("/slot/book", async (req, res) => {
  try {
    const { date, name, email, phoneNumber, time } = req.body;

    const currentDate = date.split("-");

    const day = parseInt(currentDate[0]);
    const month = parseInt(currentDate[1]) - 1;
    const year = parseInt(currentDate[2]);

    const slotDate = new Date(Date.UTC(year, month, day));
    let slot = await Slot.findOne({ date: slotDate });

    if (!slot) {
      slot = new Slot({
        date: slotDate,
        Booking: [
          {
            name,
            email,
            phoneNumber,
            time,
          },
        ],
      });
    } else {
      const isBooked = slot.Booking.some(
        (bookedSlot) => bookedSlot.time === time
      );

      if (isBooked) {
        return res.status(400).json({ message: "Slot already booked." });
      }

      slot.Booking.push({
        name,
        email,
        phoneNumber,
        time,
      });
    }

    await slot.save();
    res.status(200).json({ message: "Slot booked successfully", slot });
  } catch (error) {
    console.error("Error booking slot:", error);
    res.status(500).json({ message: "An error occurred while booking slot." });
  }
});

// payment router

router.post("/create-order", async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = req.body;
    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).send("Error creating order");
    }

    res.status(200).json(order);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).send("Error creating order");
  }
});

// payment validation router

router.post("/validate-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");

    if (digest !== razorpay_signature) {
      return res.status(400).json({ msg: "Transaction is not legit!" });
    }

    res.status(200).json({ msg: "Payment validated successfully" });
  } catch (err) {
    console.error("Error validating payment:", err);
    res.status(500).send("Error validating payment");
  }
});

module.exports = router;
