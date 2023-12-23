const Slot = require("../Model/Slot");

const router = require("express").Router();

// Get all available slots
router.get("/slot", async (req, res) => {
  try {
    const {date} = req.query
    const slots = await Slot.find({date});
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
    res.status(200).json({ message: "Slot booked successfully",slot });
  } catch (error) {
    console.error("Error booking slot:", error);
    res.status(500).json({ message: "An error occurred while booking slot." });
  }
});

module.exports = router;
