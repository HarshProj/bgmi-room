const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const RoomSchema = new Schema({
    roomName: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        default: 100
    },
    occupied:{
        type: Number,
        default: 0
    },
    roomSlots:{
        type: Number,
        default: 25
    },
    freeSlots: {
        type: Number,
        required: true
    },
    occupiedSlots: {
        type: Number,
        required: true
    },
    isEmpty: {
        type: Boolean,
        default: true
    }
    
}, { timestamps: true });
const Room = mongoose.model('Room', RoomSchema);
module.exports = Room;