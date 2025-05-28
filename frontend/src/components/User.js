import "./User.css";
import React, { useState, useEffect } from "react";

const User = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newUser, setNewUser] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "user", // Default to "user"
    });
    const [addUserError, setAddUserError] = useState(null);
    const [showModal, setShowModal] = useState(false); // For showing/hiding modal

    useEffect(() => {
        const token = localStorage.getItem("authToken");

        fetch("http://localhost:5000/users", {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch users");
                }
                return response.json();
            })
            .then((data) => {
                setUsers(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching users:", error);
                setError(error.message);
                setLoading(false);
            });
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser({
            ...newUser,
            [name]: value,
        });
    };

    const handleAddUser = (e) => {
        e.preventDefault();
        const token = localStorage.getItem("authToken");

        fetch("http://localhost:5000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(newUser),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setUsers((prevUsers) => [
                        ...prevUsers,
                        { ...newUser, role: newUser.role },
                    ]);
                    setNewUser({
                        firstName: "",
                        lastName: "",
                        email: "",
                        password: "",
                        role: "user",
                    });
                    setAddUserError(null); // Clear error message
                    setShowModal(false); // Close modal after adding user
                } else {
                    setAddUserError(data.message);
                }
            })
            .catch((error) => {
                console.error("Error adding user:", error);
                setAddUserError("Error adding user. Please try again.");
            });
    };

    const toggleModal = () => {
        setShowModal(!showModal);
    };

    if (loading) return <p>Loading users...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <div className="user-list-container">
            <h2 className="heading">User Accounts</h2>
                <button className="add-user-btn" onClick={toggleModal}>
                   
                </button>
                {users.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
                                <tr key={index}>
                                    <td>{`${user.firstName} ${user.lastName}`}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No users found</p>
                )}
            </div>

            {/* Modal for adding new user */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Add New User</h3>
                        <form onSubmit={handleAddUser}>
                            <div>
                                <label>First Name:</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={newUser.firstName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label>Last Name:</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={newUser.lastName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={newUser.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label>Password:</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={newUser.password}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label>Role:</label>
                                <select
                                    name="role"
                                    value={newUser.role}
                                    onChange={handleInputChange}
                                >
                                    <option value="staff">Staff</option>
                                    {/*<option value="admin">Admin</option>*/}
                                </select>
                            </div>
                            {addUserError && <p className="error">{addUserError}</p>}
                            <button type="submit">Add User</button>
                        </form>
                        <button className="close-modal-btn" onClick={toggleModal}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default User;