const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid'); // Adding missing uuid import
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection URI
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/residents_DB';
const dbName = process.env.DB_NAME || 'residents_DB';

// Mongoose Models
const residentSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true, 
    unique: true 
  },
  firstname: { 
    type: String, 
    required: true 
  },
  lastname: { 
    type: String, 
    required: true 
  },
  birthday: { 
    type: String, 
    required: true 
  },
  gender: { 
    type: String, 
    required: true 
  },
  age: { 
    type: Number, 
    required: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  pnumber: { 
    type: String, 
    required: true 
  },
  civilStatus: { 
    type: String, 
    required: true 
  },
  nationality: { 
    type: String, 
    required: true 
  },
  religion: { 
    type: String, 
    required: true 
  },
  houseNumber: { 
    type: String, 
    required: true 
  },
  purok: { 
    type: String, 
    required: true 
  },
  yearsOfResidency: { 
    type: Number, 
    required: true 
  },
  voter: { 
    type: String, 
    required: true 
  },
  employmentStatus: { 
    type: String, 
    required: true 
  },
  occupation: { 
    type: String, 
    required: true 
  },
  monthlyIncome: { 
    type: Number, 
    required: true 
  },
  educationLevel: { 
    type: String, 
    required: true 
  },
  senior: { 
    type: String, 
    required: true 
  },
  pwd: { 
    type: String, 
    required: true 
  }
}, { 
  timestamps: true 
});

const qrTokenSchema = new mongoose.Schema({
  token: { 
    type: String, 
    required: true, 
    unique: true 
  },
  residentId: { 
    type: String, 
    required: true 
  },
  expiration: { 
    type: Date, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const scanLogSchema = new mongoose.Schema({
  residentId: { 
    type: String, 
    required: true 
  },
  purpose: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

// Create models
const Resident = mongoose.model('Resident', residentSchema);
const QrToken = mongoose.model('QrToken', qrTokenSchema);
const ScanLog = mongoose.model('ScanLog', scanLogSchema);

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB using Mongoose');
    return true;
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
}

// Connect to MongoDB before setting up routes
(async () => {
  try {
    await connectToMongoDB();
    
    // Middleware
    app.use(cors());
    app.use(bodyParser.json());

    // Import authentication routes
    // Assuming Authentication module is adjusted to work with Mongoose
    // You'll need to update the authentication module to use Mongoose models
    const authRoutes = require('./Authentication')(mongoose);  
    app.use('/', authRoutes);

    /*--------------------------CRUD---------------------*/
    app.post('/residents', async (req, res) => {
      const { 
        id, 
        firstname, 
        lastname, 
        birthday, 
        gender, 
        age, 
        address, 
        email, 
        pnumber, 
        civilStatus, 
        nationality,
        religion, 
        houseNumber, 
        purok, 
        yearsOfResidency, 
        voter,
        employmentStatus, 
        occupation, 
        monthlyIncome, 
        educationLevel,
        senior,
        pwd
      } = req.body;
    
      // Validate input fields
      if (!id || 
      !firstname || 
      !lastname || 
      !birthday || 
      !gender || 
      !age || 
      !address || 
      !email || 
      !pnumber || 
      !civilStatus || 
      !nationality || 
      !religion || 
      !houseNumber || 
      !purok || 
      !yearsOfResidency || 
      !voter || 
      !employmentStatus || 
      !occupation || 
      !monthlyIncome|| 
      !educationLevel ||
      !senior ||
      !pwd 
    ) {
        return res.status(400).json({ message: 'All fields are required' });
      }
    
      try {
        // Ensure ID is not null
        if (!id) {
          return res.status(400).json({ message: 'Resident ID is required' });
        }
        
        // Check if resident with this ID already exists
        const existingResident = await Resident.findOne({ id });
        if (existingResident) {
          return res.status(409).json({ message: 'Resident with this ID already exists' });
        }

        // Create new resident using mongoose model
        const resident = new Resident({ 
          id,
          firstname, 
          lastname, 
          birthday, 
          gender, 
          age, 
          address, 
          email, 
          pnumber, 
          civilStatus, 
          nationality,
          religion, 
          houseNumber, 
          purok, 
          yearsOfResidency, 
          voter,
          employmentStatus, 
          occupation, 
          monthlyIncome, 
          educationLevel,
          senior,
          pwd
        });
    
        // Save resident to database
        await resident.save();
    
        // Respond with success message
        res.status(201).json({ message: 'Resident saved successfully' });
      } catch (error) {
        console.error('Error saving resident:', error);
        res.status(500).json({ message: 'Failed to save resident' });
      }
    });
    
    // Read all residents
    app.get('/residents', async (req, res) => {
      try {
        const residents = await Resident.find({});
        res.json(residents);
        console.log(residents);
      } catch (error) {
        console.error('Error retrieving residents:', error);
        res.status(500).json({ message: 'Failed to retrieve residents' });
      }
    });
    
    // Update (U)
    app.put('/residents/:id', async (req, res) => {
      const id = req.params.id;
      const { 
        firstname, 
        lastname, 
        birthday, 
        gender, 
        age, 
        address, 
        email, 
        pnumber, 
        civilStatus, 
        nationality,
        religion, 
        houseNumber, 
        purok, 
        yearsOfResidency, 
        voter,
        employmentStatus, 
        occupation, 
        monthlyIncome, 
        educationLevel,
        senior,
        pwd
      } = req.body;
    
      if (
        !firstname && !lastname && !birthday && !gender && !age && !address && 
        !email && !pnumber && !civilStatus && !nationality && !religion && !houseNumber && 
        !purok && !yearsOfResidency  && !voter && !employmentStatus && !occupation && 
        !monthlyIncome && !educationLevel && !senior && !pwd
      ) {
        return res.status(400).json({ message: 'At least one field is required to update' });
      }
    
      try {
        // Check if resident exists
        const existingResident = await Resident.findOne({ id });
        if (!existingResident) {
          return res.status(404).json({ message: 'Resident not found' });
        }
    
        // Prepare update object with only provided fields
        const updateFields = {};
        if (firstname) updateFields.firstname = firstname;
        if (lastname) updateFields.lastname = lastname;
        if (birthday) updateFields.birthday = birthday;
        if (gender) updateFields.gender = gender;
        if (age) updateFields.age = age;
        if (address) updateFields.address = address;
        if (email) updateFields.email = email;
        if (pnumber) updateFields.pnumber = pnumber;
        if (civilStatus) updateFields.civilStatus = civilStatus;
        if (nationality) updateFields.nationality = nationality;
        if (religion) updateFields.religion = religion;
        if (houseNumber) updateFields.houseNumber = houseNumber;
        if (purok) updateFields.purok = purok;
        if (yearsOfResidency) updateFields.yearsOfResidency = yearsOfResidency;
        if (voter) updateFields.voter = voter;
        if (employmentStatus) updateFields.employmentStatus = employmentStatus;
        if (occupation) updateFields.occupation = occupation;
        if (monthlyIncome) updateFields.monthlyIncome = monthlyIncome;
        if (educationLevel) updateFields.educationLevel = educationLevel;
        if (senior) updateFields.senior = senior;
        if (pwd) updateFields.pwd = pwd;
    
        // Update resident using Mongoose
        await Resident.updateOne({ id }, { $set: updateFields });
    
        res.status(200).json({ message: 'Resident updated successfully' });
      } catch (error) {
        console.error('Error updating resident:', error);
        res.status(500).json({ message: 'Failed to update resident' });
      }
    });
    
    // Delete (D)
    app.delete('/residents/:id', async (req, res) => {
      const id = req.params.id;
      try {
        const result = await Resident.deleteOne({ id });
        
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Resident not found' });
        }
        
        res.status(200).json({ message: 'Resident deleted successfully' });
      } catch (error) {
        console.error('Error deleting resident:', error);
        res.status(500).json({ message: 'Failed to delete resident' });
      }
    });
    
    // QR code endpoints
    app.post('/api/residents/:id/qr-token', async (req, res) => {
      try {
        const residentId = req.params.id;
        
        // Find the resident in the database
        const resident = await Resident.findOne({ id: residentId });
        
        if (!resident) {
          return res.status(404).json({ message: 'Resident not found' });
        }
        
        // Generate a token with expiration (24 hours)
        const token = uuidv4();
        const expiration = new Date();
        expiration.setHours(expiration.getHours() + 24);
        
        // Store the token in the database
        const qrToken = new QrToken({
          token,
          residentId,
          expiration,
          createdAt: new Date()
        });
        
        await qrToken.save();
        
        res.json({ token, expiration });
      } catch (error) {
        console.error('Error generating QR token:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Verify a QR token
    app.get('/api/verify-qr/:token', async (req, res) => {
      try {
        const { token } = req.params;
        
        // Find the token in the database
        const tokenDoc = await QrToken.findOne({ token });
        
        if (!tokenDoc) {
          return res.status(404).json({ message: 'Invalid QR code' });
        }
        
        // Check if token is expired
        if (new Date() > new Date(tokenDoc.expiration)) {
          return res.status(401).json({ message: 'QR code has expired' });
        }
        
        // Get the resident data
        const resident = await Resident.findOne({ id: tokenDoc.residentId });
        
        if (!resident) {
          return res.status(404).json({ message: 'Resident not found' });
        }
        
        // Return resident data
        res.json({ 
          verified: true,
          resident: {
            id: resident.id,
            firstname: resident.firstname,
            lastname: resident.lastname,
            gender: resident.gender,
            age: resident.age,
            address: resident.address,
            purok: resident.purok
          }
        });
      } catch (error) {
        console.error('Error verifying QR token:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Log QR code scan (for tracking purposes)
    app.post('/api/log-scan', async (req, res) => {
      try {
        const { residentId, purpose, location } = req.body;
        
        // Create scan log
        const scanLog = new ScanLog({
          residentId,
          purpose,
          location,
          timestamp: new Date()
        });
        
        await scanLog.save();
        
        res.status(201).json({ message: 'Scan logged successfully' });
      } catch (error) {
        console.error('Error logging scan:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Simple endpoint to verify a resident directly by ID
    app.get('/api/verify-resident/:id', async (req, res) => {
      try {
        const { id } = req.params;
        
        // Find the resident
        const resident = await Resident.findOne({ id });
        
        if (!resident) {
          return res.status(404).json({ message: 'Resident not found' });
        }
        
        // Return limited resident data
        res.json({
          verified: true,
          resident: {
            id: resident.id,
            firstname: resident.firstname,
            lastname: resident.lastname,
            gender: resident.gender,
            age: resident.age,
            address: resident.address,
            purok: resident.purok
          }
        });
      } catch (error) {
        console.error('Error verifying resident:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
//=========================
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Server initialization error:', err);
    process.exit(1);
  }
})();