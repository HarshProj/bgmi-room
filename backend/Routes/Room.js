const express = require('express');
const router = express.Router();
const Room = require('../Model/Room');
// const bcrypt = require('bcryptjs');
const authorization = require('../Middleware/Authorization');
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
//Update room  slots
router.put('/update-slot/:id',authorization, async (req, res) => {
    try {
        const { roomName, password, capacity, roomSlots } = req.body;
        
        // Build update object dynamically
        const updateData = {};

        // Validate and add room name if provided
        if (roomName !== undefined && roomName !== null) {
            if (!roomName || roomName.trim() === '') {
                return res.status(400).json({ error: 'Room name cannot be empty' });
            }
            
            // Check if room name already exists (excluding current room)
            const existingRoom = await Room.findOne({ 
                roomName: roomName.trim(), 
                _id: { $ne: req.params.id } 
            });
            
            if (existingRoom) {
                return res.status(400).json({ error: 'Room name already exists' });
            }
            
            updateData.roomName = roomName.trim();
        }

        // Add password to update ONLY if provided
        if (password && password.trim() !== '') {
            if (password.length < 4) {
                return res.status(400).json({ error: 'Password must be at least 4 characters long' });
            }
            updateData.password = password.trim();
        }

        // Get current room to validate constraints
        const currentRoom = await Room.findById(req.params.id);
        if (!currentRoom) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Validate and add capacity if provided
        if (capacity !== undefined && capacity !== null) {
            const newCapacity = parseInt(capacity);
            
            if (isNaN(newCapacity) || newCapacity < 1) {
                return res.status(400).json({ error: 'Capacity must be at least 1' });
            }
            
            if (newCapacity < currentRoom.occupied) {
                return res.status(400).json({ 
                    error: `Cannot set capacity below current occupied players (${currentRoom.occupied})` 
                });
            }
            
            updateData.capacity = newCapacity;
        }

        // Validate and add room slots if provided
        if (roomSlots !== undefined && roomSlots !== null) {
            const newRoomSlots = parseInt(roomSlots);
            
            if (isNaN(newRoomSlots) || newRoomSlots < 1) {
                return res.status(400).json({ error: 'Room slots must be at least 1' });
            }
            
            if (newRoomSlots < currentRoom.occupiedSlots) {
                return res.status(400).json({ 
                    error: `Cannot set room slots below current occupied slots (${currentRoom.occupiedSlots})` 
                });
            }
            
            updateData.roomSlots = newRoomSlots;
            updateData.freeSlots = newRoomSlots - currentRoom.occupiedSlots;
        }

        // Update isEmpty status
        updateData.isEmpty = currentRoom.occupiedSlots === 0;

        // Update the room
        const updatedRoom = await Room.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        res.status(200).json(updatedRoom);
    } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({ error: error.message });
    }
});
router.delete('/delete-slot/:id', authorization,async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Optional: Prevent deletion if room has active players
        if (room.occupied > 0) {
            return res.status(400).json({ 
                error: `Cannot delete room with active players. Current players: ${room.occupied}`,
                allowForce: true // Frontend can use this to show "Force Delete" option
            });
        }

        await Room.findByIdAndDelete(req.params.id);
        
        res.status(200).json({ 
            message: 'Room deleted successfully', 
            deletedRoom: {
                id: room._id,
                roomName: room.roomName
            }
        });
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;