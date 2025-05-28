import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
//QR Code
import { QRCodeSVG } from 'qrcode.react'; // Import QRCode library
import Papa from 'papaparse';
import LoginPanel from './components/LoginPanel.js';
import User from './components/User.js';
import Dashboard from './components/Dashboard.js'
import ResidentRecords from './components/ResidentRecords.js'
import ReportsAnalytics from './components/ReportsAnalytics.js'
import { LogOut, Home, LibraryBig,Users, ChartColumnBig, QrCode} from 'lucide-react';



const API_URL = 'http://localhost:5000/residents';


function App() {
  const [formData, setFormData] = useState({ 
    id: '', firstname: '', lastname: '', birthday: '', gender: '', age: '',  address: '', 
    email: '', pnumber: '', civilStatus: '', nationality: '', religion: '',  houseNumber: '', 
    purok: '', yearsOfResidency: '', voter:'', employmentStatus: '', occupation: '', monthlyIncome: '', 
    educationLevel: '' , senior: '' , pwd: '' 
  });
  
  const [showViewMoreModal, setShowViewMoreModal] = useState(false); //For View more Modal
  const [residents, setresidents] = useState([]);//residents data
  const [isEditing, setIsEditing] = useState(false);//Editing the add/update modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);//Add/Update Modal Show/close
  const [activeView, setActiveView] = useState('dashboard');//See First Dashboard upopn login
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredresidents, setFilteredresidents] = useState([]);
  const [inputMethod, setInputMethod] = useState('manual');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  //const [logs, setLogs] = useState([]);
  const [residentToDeleteId, setresidentToDeleteId] = useState(null);
   //QRCODE
   const [showQRModal, setShowQRModal] = useState(false); // New state for QR modal

  const itemsPerPage = 10;
    const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: ""
  });


  const navRef = useRef(null);

// Constant for User Roles
  const userRoles = {
    admin: ['view_residents', 'add_resident', 'edit_resident', 'delete_resident', 'view_user', 'view_visualization', 'household', 'events'],
    staff: ['view_residents', 'add_resident', 'edit_resident', 'delete_resident','view_visualization', 'household']
  };


  const hasPermission = (permission) => {
    if (!currentUser || !currentUser.role) return false;
    const permissions = userRoles[currentUser.role] || [];
    return permissions.includes(permission);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    
    // Ensure storedUser is valid before parsing
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Invalid JSON in localStorage:", error);
        localStorage.removeItem('user'); 
      }
    }
  
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  
    setLoading(false);
  }, []);
  

  useEffect(() => {
    if (isAuthenticated) {
      fetchresidents();
    }
  }, [isAuthenticated]);

  //QR code
    // Add this new function to handle QR code display
  const handleShowQR = (resident) => {
    setFormData(resident);
    setShowQRModal(true);
  };

  // Event handlers for Login/Logout
  const handleLogin = (user, token) => {
    console.log("Logged in user:", user); // Debug
    setCurrentUser(user);
    setIsAuthenticated(true);

  //  update userData 
  setUserData({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    role: user.role || ""
  });
    
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user)); 
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    /*addLog(`User logged in: ${user.email}`);*/
    toast.success('Logged in successfully!');

    console.log("Current user:", currentUser);
    console.log("Has 'account' permission:", hasPermission('account'));
  };
 /**Logout */
  const handleLogout = () => {
    setShowLogoutModal(true);
  };


  const confirmLogout = () => {
    toast.success('Logged out successfully');

    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
      setCurrentUser(null);
      setActiveView('dashboard');
      setShowLogoutModal(false);
      
      /*addLog('User logged out');*/
    }, 800);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


//NAVIGATION

const handleNavClick = (view) => {
  setActiveView(view);
};

const renderContent = () => {
  switch (activeView) {
    case 'dashboard':
      return <Dashboard residents={residents} /*logs={logs} *//>;
    case 'table':
      return (
        <ResidentRecords
          residents={residents}
          filteredresidents={filteredresidents}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSearch={handleSearch}
          setFilteredresidents={setFilteredresidents}
          setCurrentPage={setCurrentPage}
          handleOpenAddModal={handleOpenAddModal}
          handleViewMore={handleViewMore}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          showDeleteModal={showDeleteModal}
          cancelDelete={cancelDelete}
          confirmDelete={confirmDelete}
        />
      );
    case 'UserTable':
      return <User />;
    case 'visualization':
      return (
        <ReportsAnalytics
          residents={residents}
          ageData={ageData}
          genderData={genderData}
          colors_age={['#51a2d7', '#f39c12', '#e74c3c', '#2ecc71']}
          colors={['#51a2d7', '#3790c0', '#2d7bad', '#206b9a', '#155987']}
        />
      );
      case 'map':
        return (
          <div className="map-container">
            <iframe
              width="100%"
              height="400"
              src="https://www.openstreetmap.org/export/embed.html?bbox=124.2%2C8.15%2C124.3%2C8.3&layer=mapnik"
              style={{ border: "1px solid black" }}
            />
          </div>
        );
  }
};

  //resident API CALLS
  const fetchresidents = async () => {
    try {
      const response = await axios.get(API_URL);
      setresidents(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching residents:', error);
      toast.error('Failed to fetch residents data');
    }
  };

  //-- Search Function -- 
  const handleSearch = () => {
    const filtered = residents.filter(resident =>
      `${resident.firstname} ${resident.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredresidents(filtered);
    setCurrentPage(1);

    if (searchTerm.trim() === "") {
      toast.error("Please enter a search term");
    } else if (filtered.length > 0) {
      toast.success(`${filtered.length} result(s) found for "${searchTerm}"`, {
        style: { backgroundColor: "#fff", color: "#000" },
        progressStyle: { backgroundColor: "#007bff" }
      });
      
    } else {
      toast.error("resident not found");
    }
  };

 //-- ADD resident Record via CSV -- 
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    Papa.parse(file, {
      header: true,
      complete: async (result) => {
        const csvData = result.data
          .filter(row => Object.values(row).some(value => value && String(value).trim()))
          .map(resident => {
            // Format the birthday to YYYY-MM-DD
            let formattedBirthday = resident.birthday?.toString().trim();
            
            // Check if the birthday is in a different format and convert it
            if (formattedBirthday) {
              // Try to parse the date
              const parsedDate = new Date(formattedBirthday);
              if (!isNaN(parsedDate.getTime())) {
                // Format to YYYY-MM-DD
                formattedBirthday = parsedDate.toISOString().split('T')[0];
              }
            } return {
            id: resident.id?.toString().trim(),
            firstname: resident.firstname?.toString().trim(),
            lastname: resident.lastname?.toString().trim(),
            birthday: resident.birthday?.toString().trim(),
            gender: resident.gender?.toString().trim(),
            age: resident.age ? parseInt(resident.age.toString().trim(), 10) : null,
            address: resident.address?.toString().trim(),
            email: resident.email?.toString().trim(),
            pnumber: resident.pnumber?.toString().trim(),
            civilStatus: resident.civilStatus?.toString().trim(),
            nationality: resident.nationality?.toString().trim(),
            religion: resident.religion?.toString().trim(),
            houseNumber: resident.houseNumber?.toString().trim(),
            purok: resident.purok?.toString().trim(),
            yearsOfResidency: resident.yearsOfResidency ? parseInt(resident.yearsOfResidency.toString().trim(), 10) : null,
            voter: resident.voter?.toString().trim(),
            employmentStatus: resident.employmentStatus?.toString().trim(),
            occupation: resident.occupation?.toString().trim(),
            monthlyIncome: resident.monthlyIncome?.toString().trim(),
            educationLevel: resident.educationLevel?.toString().trim(),
            senior: resident.senior?.toString().trim(),
            pwd: resident.pwd?.toString().trim(),
          };
      });
          
  
          const invalidRows = csvData.filter(resident => {
            return !resident.id || 
                   !resident.firstname || 
                   !resident.lastname || 
                   !resident.birthday || 
                   !resident.gender || 
                   resident.age === null || 
                   !resident.address || 
                   !resident.email || 
                   !resident.pnumber || 
                   !resident.civilStatus || 
                   !resident.nationality || 
                   !resident.religion || 
                   !resident.houseNumber || 
                   !resident.purok || 
                   resident.yearsOfResidency === null || 
                   !resident.voter || 
                   !resident.employmentStatus || 
                   !resident.occupation || 
                   !resident.monthlyIncome || 
                   !resident.educationLevel||
                   !resident.senior || 
                   !resident.pwd  ;
          });
          
  
        if (invalidRows.length > 0) {
          toast.error(`CSV contains ${invalidRows.length} row(s) with missing required fields.`);
          return;
        }
  
        if (csvData.length === 0) {
          toast.error('No valid data found in CSV');
          return;
        }
  
        try {
          for (const resident of csvData) {
            await axios.post(API_URL, resident);
          }
          toast.success('CSV uploaded successfully!');
          fetchresidents();
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          toast.error(`Error uploading CSV: ${errorMessage}`);
        }
      },
      error: (error) => {
        console.error('Papa Parse error:', error);
        toast.error('Error parsing CSV file');
      }
    });
  };

  //-- ADD resident Record Manually  -- 
  const handleClose = () => {
    setIsFormModalOpen(false);
    setShowViewMoreModal(false);
    setShowQRModal(false);
  };
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
        console.log('Form data being sent:', formData);
        const response = await axios.post(API_URL, formData);
        console.log('Response:', response);
        toast.success('resident added successfully!');
        fetchresidents();

        const residentName = `${formData.firstname} ${formData.lastname}`;

        setFormData({ 
          id: '', 
          firstname: '', 
          lastname: '', 
          birthday: '', 
          gender: '', 
          age: '', 
          address: '', 
          email: '', 
          pnumber: '', 
          civilStatus: '', 
          nationality: '', 
          religion: '', 
          houseNumber: '', 
          purok: '', 
          yearsOfResidency: '', 
          voter:'',
          employmentStatus: '', 
          occupation: '', 
          monthlyIncome: '', 
          educationLevel: '' ,
          senior: '',
          pwd: ''
        });
        
        setIsFormModalOpen(false);

    } catch (error) {
        console.error('Error details:', error.response);
        toast.error('Error adding resident!');
        toast.error(`Error adding resident: ${error.message}`);
    }
};

   //-- DELETE resident Record --    
  const handleDelete = (id) => {
    setresidentToDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (!residentToDeleteId) {
        toast.error('No resident selected for deletion!');
        return;
      }

      const residentToDelete = residents.find(resident => resident.id === residentToDeleteId);
      const residentName = residentToDelete ? `${residentToDelete.firstname} ${residentToDelete.lastname}` : 'Unknown';

      await axios.delete(`${API_URL}/${residentToDeleteId}`);
      
      toast.success('resident deleted!');
      fetchresidents();
      setShowDeleteModal(false);
      setresidentToDeleteId(null);
      /*addLog(`Deleted resident: ${residentName}`);*/

    } catch (error) {
      toast.error('Error deleting resident!');
      console.error(error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setresidentToDeleteId(null);
  };

  //-- READ - VIEW MORE resident Record --    
  const handleViewMore = (resident) => {
    setFormData(resident);
    setShowViewMoreModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/${formData.id}`, formData);
      toast.success('resident updated successfully!');
      fetchresidents();
      setFormData({ 
        id: '', 
        firstname: '', 
        lastname: '', 
        birthday: '', 
        gender: '', 
        age: '', 
        address: '', 
        email: '', 
        pnumber: '', 
        civilStatus: '', 
        nationality: '', 
        religion: '', 
        houseNumber: '', 
        purok: '', 
        yearsOfResidency: '', 
        voter:'',
        employmentStatus: '', 
        occupation: '', 
        monthlyIncome: '', 
        educationLevel: '' ,
        senior: '',
        pwd: ''
      });
      
      setIsEditing(false);
      setIsFormModalOpen(false);
    } catch (error) {
      toast.error('Error updating resident!');
    }
  };
  
  //Modal For Add/Update resident Record
  const handleOpenAddModal = () => {
    setFormData({ 
      id: '', firstname: '', lastname: '', birthday: '', gender: '', age: '', address: '', email: '', pnumber: '', 
      civilStatus: '', nationality: '',religion: '',  houseNumber: '', purok: '', yearsOfResidency: '', voter:'',employmentStatus: '', 
      occupation: '', monthlyIncome: '', educationLevel: '',senior: '', pwd: ''
    });
    
    setIsEditing(false);
    setIsFormModalOpen(true);
  };


  const handleEdit = (resident) => {
    let formattedBirthday = '';
  
    if (resident.birthday) {
      const parsedDate = new Date(resident.birthday);
      
      if (!isNaN(parsedDate.getTime())) { // Check if the date is valid
        formattedBirthday = parsedDate.toISOString().split('T')[0];
      }
    }
  
    setFormData({
      ...resident,
      birthday: formattedBirthday, // Ensure correct format or empty if invalid
    });
  
    setIsEditing(true);
    setIsFormModalOpen(true);
  };
  

  // Data processing for visualizations
  const genderGroups = residents.reduce((acc, resident) => {
    acc[resident.gender] = (acc[resident.gender] || 0) + 1;
    return acc;
  }, {});

  const genderData = Object.entries(genderGroups).map(([gender, count]) => ({
    name: gender,
    value: count
  }));

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <LoginPanel onLogin={handleLogin} />;


  }



const ageDistribution = residents.reduce((acc, resident) => {
  const ageGroup = `${Math.floor(resident.age / 5) * 5}-${Math.floor(resident.age / 5) * 5 + 4}`;
  acc[ageGroup] = (acc[ageGroup] || 0) + 1;
  return acc;
}, {});

const ageData = Object.entries(ageDistribution)
  .map(([name, value]) => ({ name, value }))
  .sort((a, b) => parseInt(a.name) - parseInt(b.name));

//QR code
 // Generate QR code data
  const generateQRData = (resident) => {
    /*return JSON.stringify({
      id: resident.id,
      name: `${resident.firstname} ${resident.lastname}`,
      age: resident.age,
      address: resident.address,
      purok: resident.purok,
      contact: resident.pnumber
    });*/
    return `tel:${resident.pnumber}`;
  };
return (
  <>
            <div className="main-content-wrapper">
                <div 
                    ref={navRef}
                   className="side-navigation"
                >
                  <div className="sidebar-header">
                    <img 
                      src="/logo.jpg" 
                      alt="Barangay Logo" 
                      className="barangay-logo" 
                      onClick={() => setActiveView('map')} // Change view to 'map'
                      style={{ cursor: 'pointer' }} 
                    />
                    <h2 
                      className="barangay-name" 
                      onClick={() => setActiveView('map')} 
                      style={{ cursor: 'pointer' }}
                    >
                      Bagong Silang
                    </h2>
                  </div>
                    <div className="menu-content">
                        <div className="nav-buttons">
                            <button 
                               onClick={() => handleNavClick('dashboard')}
                                className="nav-button"
                            >
                                <Home size={20} style={{  marginRight: "10px" }} />Dashboard
                            </button>
        
                            {hasPermission('view_residents') && (
                                <button 
                                    onClick={() => handleNavClick('table')}
                                    className="nav-button"
                                >
                                  <LibraryBig size={20} style={{ marginRight: "10px" }}  />  Residents
                                </button>
                            )}

                            {hasPermission('view_user') && (
                                <button 
                                   onClick={() => handleNavClick('UserTable')}
                                    className="nav-button"
                                >
                                  <Users size={20} style={{  marginRight: "10px" }} />  User Management
                                </button>
                            )}
        
                            
                            {hasPermission('view_visualization') && (
                                <button 
                                    onClick={() => handleNavClick('visualization')}
                                    className="nav-button"
                                >
                                  <ChartColumnBig size={20} style={{ marginRight: "10px" }} />  Analytics
                                </button>
                            )}
                           
                            
                            <button onClick={handleLogout} className="logout-btn">
                                <LogOut size={15} /> Logout
                            </button>
                        </div>
                    </div>
                </div>

                <div className="content-section">
                    {renderContent()}
                </div>
            </div>

      {showLogoutModal && (
        <div className="modal-overlay-logout">
          <div className="modal-card-logout">
            <h3>Are you sure you want to logout?</h3>
            <div className="modal-actions-out">
              <button onClick={cancelLogout} className="cancel-btn">
                Cancel
              </button>
              <button onClick={confirmLogout} className="confirm-btn">
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Form Modal */}
        {isFormModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
            <button className="close-button" onClick={handleClose}>
              &times;
            </button>
              <h2>{isEditing ? "Update resident " : "Add resident "}</h2>


              {/* Input Method Selector */}
              {!isEditing && (
                <div className="input-method-selector">
                  <label>
                     Method:
                    <select
                      value={inputMethod}
                      onChange={(e) => setInputMethod(e.target.value)}
                    >
                      <option value="manual">Manual Entry</option>
                      <option value="csv">Upload CSV</option>
                    </select>
                  </label>
                </div>
              )}


              {/* Form Content */}
              {inputMethod === 'manual' ? (
               <form onSubmit={isEditing ? handleEditSubmit : handleAddSubmit}>
               {/* Identification Section form-section */}
               <div className="info-section">
                 <div className="section-title">
                   <i className="fa fa-id-card"></i> Identification
                 </div>
                 <div className="form-grid">
                   <div className="full-width">
                     <label className="required-field">
                       ID:
                       <input
                         type="text"
                         name="id"
                         placeholder="Resident ID"
                         value={formData.id}
                         onChange={handleChange}
                         required
                         disabled={isEditing}
                       />
                     </label>
                   </div>
                 </div>
               </div>
               
               {/* Personal Information Section */}
               <div className="form-section">
                 <div className="section-title">
                   <i className="fa fa-user"></i> Personal Information
                 </div>
                 <div className="form-grid">
                   <div>
                     <label className="required-field">
                       First Name:
                       <input
                         type="text"
                         name="firstname"
                         placeholder="First Name"
                         value={formData.firstname}
                         onChange={handleChange}
                         required
                       />
                     </label>
                   </div>
                   
                   <div>
                     <label className="required-field">
                       Last Name:
                       <input
                         type="text"
                         name="lastname"
                         placeholder="Last Name"
                         value={formData.lastname}
                         onChange={handleChange}
                         required
                       />
                     </label>
                   </div>
                   
                   <div>
                     <label className="required-field">
                       Birthday:
                       <input
                         type="date"
                         name="birthday"
                         value={formData.birthday}
                         onChange={handleChange}
                         required
                       />
                     </label>
                   </div>
                   
                   <div>
                     <label className="required-field">
                       Age:
                       <input
                         type="number"
                         name="age"
                         placeholder="Age"
                         value={formData.age}
                         onChange={handleChange}
                         required
                       />
                     </label>
                   </div>
                   
                   <div>
                     <label className="required-field">
                       Gender:
                       <select name="gender" value={formData.gender} onChange={handleChange} required>
                         <option value="" disabled>Select Gender</option>
                         <option value="Female">Female</option>
                         <option value="Male">Male</option>
                       </select>
                     </label>
                   </div>
                   
                   <div>
                     <label className="required-field">
                       Civil Status:
                       <select name="civilStatus" value={formData.civilStatus} onChange={handleChange} required>
                         <option value="" disabled>Select Civil Status</option>
                         <option value="Single">Single</option>
                         <option value="Married">Married</option>
                         <option value="Widowed">Widowed</option>
                         <option value="Divorced">Divorced</option>
                       </select>
                     </label>
                   </div>
                   {/**Nationality */}
                   <div>
                     <label className="required-field">
                       Nationality:
                       <input
                         type="text"
                         name="nationality"
                         placeholder="Nationality"
                         value={formData.nationality}
                         onChange={handleChange}
                         required
                       />
                     </label>
                   </div>
                   
                   <div>
                     <label className="required-field">
                       Religion:
                       <input
                         type="text"
                         name="religion"
                         placeholder="Religion"
                         value={formData.religion}
                         onChange={handleChange}
                         required
                       />
                     </label>
                   </div>
                 </div>
               </div>
               
               {/* Contact Information Section */}
               <div className="form-section">
                 <div className="section-title">
                   <i className="fa fa-address-book"></i> Contact Information
                 </div>
                 <div className="form-grid">
                   <div className="medium-width">
                     <label className="required-field">
                       Email:
                       <input
                         type="email"
                         name="email"
                         placeholder="Email Address"
                         value={formData.email}
                         onChange={handleChange}
                         required
                       />
                     </label>
                   </div>
                   
                   <div>
                     <label className="required-field">
                       Phone Number:
                       <input
                         type="number"
                         name="pnumber"
                         placeholder="Phone Number"
                         value={formData.pnumber}
                         onChange={handleChange}
                         required
                       />
                     </label>
                   </div>
                 </div>
               </div>
               
               {/* Residence Information Section */}
               <div className="form-section">
                 <div className="section-title">
                   <i className="fa fa-home"></i> Residence Information
                 </div>
                 <div className="form-grid">
                   <div className="full-width">
                     <label className="required-field">
                       Complete Address:
                       <input
                         type="text"
                         name="address"
                         placeholder="Complete Address"
                         value={formData.address}
                         onChange={handleChange}
                         required
                       />
                     </label>
                   </div>
                   
                   <div>
                     <label className="required-field">
                       House Number:
                       <input
                         type="number"
                         name="houseNumber"
                         placeholder="House Number"
                         value={formData.houseNumber}
                         onChange={handleChange}
                         required
                       />
                     </label>
                   </div>
                   
                   <div>
                     <label className="required-field">
                       Purok:
                       <input
                         type="text"
                         name="purok"
                         placeholder="Purok"
                         value={formData.purok}
                         onChange={handleChange}
                         required
                       />
                     </label>
                   </div>
                   
                   <div>
                     <label className="required-field">
                       Years of Residency:
                       <input
                         type="number"
                         name="yearsOfResidency"
                         placeholder="Years of Residency"
                         value={formData.yearsOfResidency}
                         onChange={handleChange}
                         required
                       />
                     </label>
                   </div>
                   <div>
                     <label className="required-field">
                       Voter:
                       <select name="voter" value={formData.voter} onChange={handleChange} required>
                       <option value="" disabled>select</option>
                         <option value="yes">yes</option>
                         <option value="no">no</option>
                       </select>
                     </label>
                   </div>
                 </div>
               </div>
               
               {/* Socioeconomic Information Section */}
               <div className="form-section">
                 <div className="section-title">
                   <i className="fa fa-briefcase"></i> Socioeconomic Information
                 </div>
                 <div className="form-grid">
                   <div>
                     <label className="required-field">
                       Employment Status:
                       <select name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} required>
                         <option value="" disabled>Select Employment Status</option>
                         <option value="Employed">Employed</option>
                         <option value="Unemployed">Unemployed</option>
                         <option value="Self-Employed">Self-Employed</option>
                         <option value="Retired">Retired</option>
                         <option value="Student">Student</option>
                       </select>
                     </label>
                   </div>
                   
                   <div>
                     <label className="required-field">
                       Occupation / Job Title:
                       <input
                         type="text"
                         name="occupation"
                         placeholder="Occupation / Job Title"
                         value={formData.occupation}
                         onChange={handleChange}
                         required
                       />
                     </label>
                   </div>
                   
                   <div>
                     <label className="required-field">
                       Monthly Income :
                       <input
                         type="text"
                         name="monthlyIncome"
                         placeholder="Monthly Income "
                         value={formData.monthlyIncome}
                         onChange={handleChange}
                         required
                       />
                     </label>
                   </div>
                   
                   <div>
                     <label className="required-field">
                       Education Level:
                       <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} required>
                         <option value="" disabled>Select Education Level</option>
                         <option value="No Formal Education">No Formal Education</option>
                         <option value="Elementary">Elementary</option>
                         <option value="High School">High School</option>
                         <option value="College">College</option>
                         <option value="Vocational">Vocational</option>
                       </select>
                     </label>
                   </div>
                 </div>
               </div>
               
               {/* Special Sector */}
               <div className="form-section">
                 <div className="section-title">
                   <i className="fa fa-briefcase"></i> Special Sector
                 </div>
                 <div className="form-grid">
                   <div>
                     <label className="required-field">
                       Senior Citizen:
                       <select name="senior" value={formData.senior} onChange={handleChange} required>
                       <option value="" disabled>select</option>
                         <option value="yes">yes</option>
                         <option value="no">no</option>
                       </select>
                     </label>
                   </div>
                   
                   <div>
                     <label className="required-field">
                       PWD:
                       <select name="pwd" value={formData.pwd} onChange={handleChange} required>
                       <option value="" disabled>select</option>
                         <option value="yes">yes</option>
                         <option value="no">no</option>
                       </select>
                     </label>
                   </div>
                   
                 </div>
               </div>
               
               {/* Form Actions */}
               <div className="form-actions">
                 <button type="button" onClick={() => setIsFormModalOpen(false)}>Cancel</button>
                 <button type="submit">{isEditing ? "Update Resident" : "Add Resident"}</button>
               </div>
             </form>
              
              ) : (
                /* Upload CSV */
                <div className="csv-upload">
                  <input type="file" accept=".csv" onChange={handleCSVUpload} />
                  <button
                    className="close-btn"
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

       {showViewMoreModal && (
        <div className="modal-overlay-view">
          <div className="modal-content view-modal">
          <button className="close-button" onClick={handleClose}>
          &times;</button>
            <h2 className="form-title">Resident Information</h2>
            
            <div className="info-container">
              {/* Personal Information Section */}
              <div className="info-section">
                <div className="section-title">
                  <i className="fa fa-user"></i> Personal Information
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">ID:</span>
                    <span className="info-value">{formData.id}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">First Name:</span>
                    <span className="info-value">{formData.firstname}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Last Name:</span>
                    <span className="info-value">{formData.lastname}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Birthday:</span>
                    <span className="info-value">{formData.birthday}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Age:</span>
                    <span className="info-value">{formData.age}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Gender:</span>
                    <span className="info-value">{formData.gender}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Civil Status:</span>
                    <span className="info-value">{formData.civilStatus}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Nationality:</span>
                    <span className="info-value">{formData.nationality}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Religion:</span>
                    <span className="info-value">{formData.religion}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="info-section">
                <div className="section-title">
                  <i className="fa fa-address-book"></i> Contact Information
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{formData.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone Number:</span>
                    <span className="info-value">{formData.pnumber}</span>
                  </div>
                </div>
              </div>

              {/* Residence Information Section */}
              <div className="info-section">
                <div className="section-title">
                  <i className="fa fa-home"></i> Residence Information
                </div>
                <div className="info-grid">
                  <div className="info-item full-width">
                    <span className="info-label">Complete Address:</span>
                    <span className="info-value">{formData.address}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">House Number:</span>
                    <span className="info-value">{formData.houseNumber}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Purok:</span>
                    <span className="info-value">{formData.purok}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Years of Residency:</span>
                    <span className="info-value">{formData.yearsOfResidency}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Voter:</span>
                    <span className="info-value">{formData.voter}</span>
                  </div>
                </div>
              </div>

              {/* Socioeconomic Information Section */}
              <div className="info-section">
                <div className="section-title">
                  <i className="fa fa-briefcase"></i> Socioeconomic Information
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Employment Status:</span>
                    <span className="info-value">{formData.employmentStatus}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Occupation:</span>
                    <span className="info-value">{formData.occupation}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Monthly Income:</span>
                    <span className="info-value">{formData.monthlyIncome}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Education Level:</span>
                    <span className="info-value">{formData.educationLevel}</span>
                  </div>
                </div>
              </div>
              <div className="info-section">
                <div className="section-title">
                  <i className="fa fa-briefcase"></i> Special Sector
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Senior:</span>
                    <span className="info-value">{formData.senior}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">PWD:</span>
                    <span className="info-value">{formData.pwd}</span>
                  </div>
                </div>
              </div>
             {/* QR code button */}
              <div className="qr-button-container">
                <button 
                  className="qr-generate-btn" 
                  onClick={() => handleShowQR(formData)}
                >
                  <QrCode size={16} style={{ marginRight: "5px" }} />
                  Generate QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )} 
      {/**Until here */}
        {/* QR Code Modal */}
      {showQRModal && (
        <div className="modal-overlay">
          <div className="modal-content qr-modal">
            <button className="close-button" onClick={handleClose}>
              &times;
            </button>
            <h2 className="form-title">Resident QR Code</h2>
            
            <div className="qr-code-container">
              <QRCodeSVG
                value={generateQRData(formData)}
                size={200}
                level="H"
                includeMargin={true}
              />
              <div className="qr-resident-info">
                <p><strong>ID:</strong> {formData.id}</p>
                <p><strong>Name:</strong> {formData.firstname} {formData.lastname}</p>
                <p><strong>Address:</strong> {formData.address}</p>
                <p><strong>Phone:</strong> {formData.pnumber}</p>
              </div>
              <p className="qr-instruction">Scan to view resident information</p>
              
              <div className="qr-actions">
                <button 
                  className="print-btn"
                  onClick={() => window.print()}
                >
                  Print QR Code
                </button>
                 {/* Add a test call button */}
          <a 
            href={`tel:${formData.pnumber}`}
            className="call-btn"
            style={{
              marginLeft: '10px',
              padding: '8px 15px',
              backgroundColor: '#4CAF50',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
           
          </a>
              </div>
            </div>
          </div>
        </div>
      )}      
             
           { /*</div>
          </div>
          
  </div>*/}
)
        <ToastContainer />
      
   
  </>
);
}


export default App;