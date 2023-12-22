const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    Booking: [{
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String, 
            required: true
        },
        time: {
            type: String,
            ennum:["10AM","12PM","2PM","4PM","6PM"],
            required: true
        }
    }]
});

const Slot = mongoose.model("Slot", slotSchema);

module.exports = Slot;
