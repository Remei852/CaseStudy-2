const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config(); 

const JWT_SECRET = process.env.JWT_SECRET || 'my_secret_key';

// Create User Schema
module.exports = function(mongoose) {
    // Define the User schema
    const userSchema = new mongoose.Schema({
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        firstName: {
            type: String,
            default: ''
        },
        lastName: {
            type: String,
            default: ''
        },
        role: {
            type: String,
            enum: ['admin', 'staff'],
            required: true
        }
    }, { 
        timestamps: true 
    });

    // Create the User model (or use existing)
    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // Registration endpoint
    router.post('/register', async (req, res) => {
        try {
            const { email, password, firstName, lastName, role } = req.body;
    
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.json({ success: false, message: 'User already exists' });
            }
    
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Create user document
            const userRole = role === 'admin' ? 'admin' : 'staff'; // Default to 'staff' if not 'admin'
            
            // Create and save new user using Mongoose
            const newUser = new User({
                email,
                password: hashedPassword,
                firstName: firstName || '',
                lastName: lastName || '',
                role: userRole
            });
            
            await newUser.save();
    
            res.json({ 
                success: true, 
                message: 'Registration successful', 
                role: userRole 
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ success: false, message: 'Server error during registration' });
        }
    });
   
    // Login endpoint
    router.post('/login', async (req, res) => {
        try {
            const { email, password, role } = req.body;
    
            // Find user by email using Mongoose
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }
    
            // Compare the password
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }
                
            if (!role) {
                return res.status(400).json({ success: false, message: 'Role is required' });
            }

            if (role !== user.role) {
                return res.status(403).json({ success: false, message: 'Role mismatch' });
            }
    
            // Generate token
            const token = jwt.sign({ email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    
            // Return user info including first and last name
            res.json({ 
                success: true, 
                user: { 
                    email, 
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName
                }, 
                token 
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ success: false, message: `Server error during login: ${error.message}` });
        }
    });
    
    // Users endpoint
    router.get('/users', async (req, res) => {
        try {
            // Query all users using Mongoose, excluding password
            const users = await User.find({}, { password: 0 }); // Exclude password field
            
            res.json(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ success: false, message: 'Server error while fetching users' });
        }
    });

    // Add this route to your server.js
    /*router.delete('/users/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Only allow admins to delete users
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can delete users' });
    }

    // Prevent deleting yourself
    if (decoded.email === email) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    const result = await User.deleteOne({ email });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting user' });
  }
});*/

    return router;
};