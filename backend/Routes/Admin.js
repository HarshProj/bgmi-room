const express=require('express');

const router=express.Router();
const Admin=require('../Model/Admin');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const hash=process.env.hash;
 router.post('/create-admin',async(req,res)=>{
    try{
        const{username,email,password}=req.body;
        if(!username || !email || !password){
            return res.status(400).json({error:'Please provide all required fields'});
        }
        const existingAdmin=await Admin.findOne({$or:[{username},{email}]});
        if(existingAdmin){
            return res.status(400).json({error:'Admin with this username or email already exists'});
        }
        const hashedpwd=await bcrypt.hash(password,10);
        const newAdmin=new Admin({
            username,
            email,
            password:hashedpwd
        });
        const savedAdmin=await newAdmin.save();
        res.status(201).json({message:'Admin created successfully'});
    }catch(error){
        res.status(500).json({error:error.message});
    }
 }
);
  
router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body; // Changed from username to email to match frontend
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false,
          error: 'Please provide all required fields' 
        });
      }
      
      // Find admin by email
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid email or password' 
        });
      }
      
      // Compare password
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid email or password' 
        });
      }
      
      // FIXED: Include all necessary fields in the token
      const token = jwt.sign(
        {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: 'admin'
        },
        hash,
        { expiresIn: '24h' } // Fixed: should be '24h' not '1 h'
      );
      
      // Return token and user data
      res.status(200).json({ 
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: 'admin'
        }
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });
  

module.exports=router;