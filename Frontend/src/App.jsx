import react, { useEffect, useState } from 'react'
import './App.css'
import toast from 'react-hot-toast'
import { FaEdit, FaCheck, FaBan } from "react-icons/fa";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { Formik, Form, Field, ErrorMessage, useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

function App() {
  const [data, setData] = useState([])


  useEffect(() => {
    fetch('http://localhost:8001/users')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.log(err))
  }, [])


  const handleToggle = (userId, currentStatus, name) => {
    const newStatus = currentStatus == 0 ? 1 : 0; // Toggle between 0 (active) and 1 (inactive)

    // Update the status in the backend
    fetch(`http://localhost:8001/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userStatus: newStatus }),
    })
      .then((res) => {
        if (res.ok) {
          setData((prevData) =>
            prevData.map((user) =>
              user.userId == userId ? { ...user, userStatus: newStatus } : user
            )
          );
          const firstName = name.split(' ')[0];
          toast.success('Successfully status updated for ' + firstName + '!');
        } else {
          // console.error('Failed to update user status');
          toast.error('Failed to update user status!');
        }
      })
      .catch((err) => toast.error('Error updating status:', err));
    //  console.error('Error updating status:', err));

  };


  // Function to toggle the popular status of a user
  const toggleUserPopularStatus = (userId, currentStatus) => {
    const newStatus = currentStatus === 0 ? 1 : 0; // Toggle status between 0 and 1

    fetch(`http://localhost:8001/users/${userId}/popular`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userPopular: newStatus }),
    })
      .then((res) => {
        if (res.ok) {
          setData((prevData) =>
            prevData.map((user) =>
              user.userId === userId ? { ...user, userPopular: newStatus } : user
            )
          );
          toast.success('User popular status updated!');
        } else {
          toast.error('Failed to update popular status.');
        }
      })
      .catch((err) => toast.error('Error updating popular status:', err));
  };

  // State to track the user being edited
  const [editSortBy, setEditSortBy] = useState(null); // To track the user being edited
  const [newSortBy, setNewSortBy] = useState(""); // To track the new Sort By value

  // Function to handle Sort By Edit
  const handleSortByEdit = (userId, currentSortBy) => {
    setEditSortBy(userId); // Enable editing mode for the specific user
    setNewSortBy(currentSortBy); // Pre-fill the input with the current value
  };


  //Function to handle Sort By Submit
  const handleSortBySubmit = (userId) => {
    // Update the Sort By value in the backend
    fetch(`http://localhost:8001/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userSortBy: newSortBy }),
    })
      .then((res) => {
        if (res.ok) {
          setData((prevData) =>
            prevData.map((user) =>
              user.userId === userId ? { ...user, userSortBy: newSortBy } : user
            )
          );
          setEditSortBy(null); // Exit editing mode
          toast.success("Sort By updated successfully!");
          //reload page
          // window.location.reload();
          // Instead of reloading the page, just refresh data
          fetch('http://localhost:8001/users')
            .then((res) => res.json())
            .then((updatedData) => setData(updatedData))
            .catch((err) => console.error("Error refreshing data:", err));

        } else {
          toast.error("Failed to update Sort By!");
        }
      })
      .catch((err) => toast.error("Error updating Sort By:", err));
  };


  const userForm = useFormik({
    initialValues: {
      userName: "",
      userEmail: "",
      userPassword: "",
      userMobile: "",
      userPopular: 0,
      userSortBy: 0,
      userStatus: 0,
    },
    validationSchema: Yup.object({
      userName: Yup.string()
        .min(3, "Name must be at least 3 characters long")
        .required("Name is required"),
      userEmail: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
      userPassword: Yup.string()
        .min(6, "Password must be at least 6 characters long")
        .required("Password is required"),
      userMobile: Yup.string()
        .matches(/^\d{10}$/, "Mobile must be 10 digits")
        .required("Mobile is required"),
    }),
    onSubmit: async (values) => {
      // Add userCreatedAt in Unix timestamp format
      const userData = {
        ...values,
        userCreatedAt: Math.floor(Date.now() / 1000), // Add current UNIX timestamp
      };

      try {
        const res = await fetch('http://localhost:8001/api/users', {
          method: "POST",
          body: JSON.stringify(userData),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.status === 200) {
          toast.success("User added successfully!");
          // userForm.resetForm();         

          // Reload the page after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 3000); // 3-second delay to let the notification show
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred. Please try again.");
      }
    },
  });


  return (
    <>


      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" id="default-styled-tab" data-tabs-toggle="#default-styled-tab-content" data-tabs-active-classes="text-purple-600 hover:text-purple-600 dark:text-purple-500 dark:hover:text-purple-500 border-purple-600 dark:border-purple-500" data-tabs-inactive-classes="dark:border-transparent text-gray-500 hover:text-gray-600 dark:text-gray-400 border-gray-100 hover:border-gray-300 dark:border-gray-700 dark:hover:text-gray-300" role="tablist">
          <li className="me-2" role="presentation">
            <button className="inline-block p-4 border-b-2 rounded-t-lg" id="userList-styled-tab" data-tabs-target="#styled-userList" type="button" role="tab" aria-controls="userList" aria-selected="false">
              User List</button>
          </li>
          <li className="me-2" role="presentation">
            <button className="inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" id="addUser-styled-tab" data-tabs-target="#styled-addUser" type="button" role="tab" aria-controls="addUser" aria-selected="false">
              Add User</button>
          </li>
          <li className="me-2" role="presentation">
            <button className="inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" id="editUser-styled-tab" data-tabs-target="#styled-editUser" type="button" role="tab" aria-controls="editUser" aria-selected="false">
              Edit User</button>
          </li>

        </ul>
      </div>
      <div id="default-styled-tab-content">
        <div className="hidden  rounded-lg bg-gray-50 " id="styled-userList" role="tabpanel" aria-labelledby="userList-tab">
          <table className="table-auto border-separate ">
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Id</th>
                <th>Name</th>
                <th>Email</th>
                <th>Password</th>
                <th>Mobile</th>
                <th>Popular</th>
                <th>Sort By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map(user => (
                <tr key={user.userId}>
                  <td>{data.indexOf(user) + 1}</td>
                  <td>{user.userId}</td>
                  <td>{user.userName}</td>
                  <td>{user.userEmail}</td>
                  <td>{user.userPassword}</td>
                  <td>{user.userMobile}</td>
                  <td>
                    <button
                      onClick={() =>
                        toggleUserPopularStatus(user.userId, user.userPopular)
                      }
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {user.userPopular === 0 ? (
                        <IoMdCheckmarkCircleOutline style={{ color: 'green', backgroundColor: 'white' }} />
                      ) : (
                        <FaBan style={{ color: 'red' }} />
                      )}
                    </button>
                  </td>
                  <td>
                    {editSortBy == user.userId ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <input
                          type="text"
                          value={newSortBy}
                          onChange={(e) => setNewSortBy(e.target.value)}
                          maxLength="4"
                          className="border rounded px-2 py-1 w-20"
                        />
                        <button
                          onClick={() => handleSortBySubmit(user.userId)}
                          className="ml-2 bg-green-500 text-white px-3 py-2 rounded"
                        >
                          <FaCheck />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSortByEdit(user.userId, user.userSortBy)}
                        className="text-white  bg-blue-500 px-3 py-1 rounded"
                      >
                        {user.userSortBy}
                      </button>
                    )}
                  </td>
                  <td>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={user.userStatus == 0}
                        onChange={() => handleToggle(user.userId, user.userStatus, user.userName)}
                      />
                      <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="hidden p-4 rounded-lg bg-gray-50 " id="styled-addUser" role="tabpanel" aria-labelledby="addUser-tab">
          <div className="p-4 rounded-lg bg-gray-50 w-2/4 mx-auto">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Add User</h2>
            <form onSubmit={userForm.handleSubmit}>
              {/* Name */}
              <div className="mb-4">
                <label htmlFor="userName" className="block mb-2 text-sm font-medium">
                  Name
                </label>
                <input
                  type="text"
                  id="userName"
                  name="userName"
                  onChange={userForm.handleChange}
                  onBlur={userForm.handleBlur}
                  value={userForm.values.userName}
                  className="w-full p-2 border rounded"
                />
                {userForm.touched.userName && userForm.errors.userName && (
                  <div className="text-red-500 text-sm">{userForm.errors.userName}</div>
                )}
              </div>

              {/* Email */}
              <div className="mb-4">
                <label htmlFor="userEmail" className="block mb-2 text-sm font-medium">
                  Email
                </label>
                <input
                  type="email"
                  id="userEmail"
                  name="userEmail"
                  onChange={userForm.handleChange}
                  onBlur={userForm.handleBlur}
                  value={userForm.values.userEmail}
                  className="w-full p-2 border rounded"
                />
                {userForm.touched.userEmail && userForm.errors.userEmail && (
                  <div className="text-red-500 text-sm">{userForm.errors.userEmail}</div>
                )}
              </div>

              {/* Password */}
              <div className="mb-4">
                <label htmlFor="userPassword" className="block mb-2 text-sm font-medium">
                  Password
                </label>
                <input
                  type="password"
                  id="userPassword"
                  name="userPassword"
                  onChange={userForm.handleChange}
                  onBlur={userForm.handleBlur}
                  value={userForm.values.userPassword}
                  className="w-full p-2 border rounded"
                />
                {userForm.touched.userPassword && userForm.errors.userPassword && (
                  <div className="text-red-500 text-sm">{userForm.errors.userPassword}</div>
                )}
              </div>

              {/* Mobile */}
              <div className="mb-4">
                <label htmlFor="userMobile" className="block mb-2 text-sm font-medium">
                  Mobile
                </label>
                <input
                  type="tel"
                  id="userMobile"
                  name="userMobile"
                  onChange={userForm.handleChange}
                  onBlur={userForm.handleBlur}
                  value={userForm.values.userMobile}
                  maxLength={10}
                  className="w-full p-2 border rounded"
                />
                {userForm.touched.userMobile && userForm.errors.userMobile && (
                  <div className="text-red-500 text-sm">{userForm.errors.userMobile}</div>
                )}
              </div>

              {/* Popular */}
              <div className="mb-4">
                <label htmlFor="userPopular" className="block mb-2 text-sm font-medium">
                  Popular
                </label>
                <select
                  id="userPopular"
                  name="userPopular"
                  onChange={userForm.handleChange}
                  onBlur={userForm.handleBlur}
                  value={userForm.values.userPopular}
                  className="w-full p-2 border rounded"
                >
                  <option value="1">No</option>
                  <option value="0">Yes</option>
                </select>
              </div>

              {/* Status */}
              <div className="mb-4">
                <label htmlFor="userStatus" className="block mb-2 text-sm font-medium">
                  Status
                </label>
                <select
                  id="userStatus"
                  name="userStatus"
                  onChange={userForm.handleChange}
                  onBlur={userForm.handleBlur}
                  value={userForm.values.userStatus}
                  className="w-full p-2 border rounded"
                >
                  <option value="0">Active</option>
                  <option value="1">Inactive</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-500 rounded"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
        <div className="hidden p-4 rounded-lg bg-gray-50 " id="styled-editUser" role="tabpanel" aria-labelledby="editUser-tab">
          <p className="text-sm text-gray-500 dark:text-gray-400">This is some placeholder content the <strong className="font-medium text-gray-800 dark:text-white">editUser tab's associated content</strong>. Clicking another tab will toggle the visibility of this one for the next. The tab JavaScript swaps classes to control the content visibility and styling.</p>
        </div>

      </div>


    </>
  )
}

export default App
