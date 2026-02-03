const express = require('express');
const router = express.Router();
const Room = require('../Model/Room');
// const bcrypt = require('bcryptjs');
const jwt=require('jsonwebtoken');
const authorization = require('../Middleware/Authorization');
const JWT_SECRET="HARSHHERE"
// Create a new room
router.post('/create',authorization, async (req, res) => {
    try {
        const { roomName, capacity,freeSlots,password} = req.body;
        // const hashedpwd= await bcrypt.hash(password,10);
        // console.log(hashedpwd);
        if(!roomName || !capacity || freeSlots===undefined){
            return res.status(400).json({ error: 'Please provide all required fields' });
        }
        const room= await Room.findOne({roomName});
        if(room){
            return res.status(400).json({ error: 'Room with this name already exists' });
        }
        const newRoom = new Room({
            roomName,
            capacity,
            freeSlots,
            password,
            occupiedSlots: 0
        });
        const savedRoom = await newRoom.save();
        res.status(201).json(savedRoom);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get all rooms
router.get('/all-rooms', async (req, res) => {
    try {
        const rooms = await Room.find().select('-password');
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get a specific room by ID
router.get('/:id', async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).select('-password');
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        res.status(200).json(room);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
//Update room occupied slots
router.put('/update-slot/:id', async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        const occupiedSlots  = room.occupiedSlots+1;
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        if(occupiedSlots>25){
            return res.status(400).json({ error: 'No free slots available' });
        }
        room.occupiedSlots = occupiedSlots;
        room.freeSlots = room.roomSlots - occupiedSlots;
        room.occupied = occupiedSlots*4;
        if(room.freeSlots===0){
            room.isEmpty = false;
        }
        const updatedRoom = await room.save();
        res.status(200).json(updatedRoom);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;