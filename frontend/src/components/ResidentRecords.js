import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, X, Eye, Edit, Trash2, ArrowDown, ArrowUp, Save, Download } from 'lucide-react';
import ExportButton, { exportToCSV } from './ResidentExport';

const ResidentRecords = ({ 
  residents = [], 
  filteredresidents = [], 
  currentPage, 
  itemsPerPage, 
  searchTerm, 
  setSearchTerm, 
  handleSearch, 
  setFilteredresidents, 
  setCurrentPage, 
  handleOpenAddModal, 
  handleViewMore, 
  handleEdit, 
  handleDelete,
  showDeleteModal,
  cancelDelete,
  confirmDelete
}) => {
  // State for sorting
  const [sortedResidents, setSortedResidents] = useState([]);
  const [sortDirection, setSortDirection] = useState('asc');
  // State for backup modal
 // const [showBackupModal, setShowBackupModal] = useState(false);
  
  // Helper function to determine which residents to display
  const displayedResidents = filteredresidents.length > 0 ? filteredresidents : residents;
  
  // Sort residents by ID whenever displayedResidents changes
  useEffect(() => {
    const sorted = [...displayedResidents].sort((a, b) => {
      // Convert IDs to numbers for proper numeric sorting
      const idA = parseInt(a.id);
      const idB = parseInt(b.id);
      
      if (sortDirection === 'asc') {
        return idA - idB;
      } else {
        return idB - idA;
      }
    });
    
    setSortedResidents(sorted);
  }, [displayedResidents, sortDirection]);
  
  // Function to toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };
  
  // Function to clear search
  const handleClearSearch = () => {
    setFilteredresidents([]);
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Quick export function - exports all resident data immediately
  const handleQuickExport = () => {
    exportToCSV(residents, 'all-residents-data');
  };

  // Calculate total pages
  const totalPages = Math.ceil(sortedResidents.length / itemsPerPage);
  
  // Get current page data
  const currentResidents = sortedResidents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="dashboard-container">
      <h2 className="heading">Resident List</h2>
      
      <div className="table-controls">
        <div className="search-container">
          <div className="search-input-wrapper">
            <input  
              type="text"
              placeholder="Search by Firstname, Lastname, or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search-btn" 
                onClick={handleClearSearch}
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button className="search-btn" onClick={handleSearch}>
            <Search size={16} />
            <span>Search</span>
          </button>

          <button className="add-resident-btn" onClick={handleOpenAddModal}>
            <PlusCircle size={20} />
          </button>
          
          {/* Export Button *
          <ExportButton 
            residents={residents}
            showBackupModal={showBackupModal}
            setShowBackupModal={setShowBackupModal}
          />
/}
          
          {/* Quick Export Button (alternative) */}
          <button 
            className="quick-export-btn" 
            onClick={handleQuickExport}
            title="Quick Export All Data"
          >
            <Download size={20} />
          {/*<span>Export</span>*/}
          </button>
        </div>
      </div>
      
      <div className="table-container">
        <table className="resident-table">
          <thead>
            <tr>
              <th onClick={toggleSortDirection} className="sortable-header">
                ID {sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              </th>
              <th>Name</th>
              <th>Birthday</th>
              <th>Gender</th>
              <th>Age</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Actions</th>
            </tr>
          </thead>  
          <tbody>
            {currentResidents.length > 0 ? (
              currentResidents.map((resident) => (
                <tr key={resident.id}>
                  <td>{resident.id}</td>
                  <td>{resident.lastname} {resident.firstname}</td>
                  <td>{resident.birthday}</td>
                  <td>{resident.gender}</td>
                  <td>{resident.age}</td>
                  <td>{resident.email}</td>
                  <td>{resident.pnumber}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="view-button" 
                        onClick={() => handleViewMore(resident)}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(resident)}
                        title="Edit Resident"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(resident.id)}
                        title="Delete Resident"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="empty-table-row">
                <td colSpan="8">
                  No residents found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {residents.length > 0 && (
        <div className="pagination">
          <button
            className="pagination-arrow"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            &laquo;
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`pagination-number ${currentPage === i + 1 ? 'active' : ''}`}
            >
              {i + 1}
            </button>
          ))}
          
          <button
            className="pagination-arrow"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            &raquo;
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-card">
            <h3>Are you sure you want to delete this resident?</h3>
            <div className="delete-modal-actions">
              <button onClick={cancelDelete} className="cancel-btn">
                Cancel
              </button>
              <button onClick={confirmDelete} className="confirm-btn">
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentRecords;