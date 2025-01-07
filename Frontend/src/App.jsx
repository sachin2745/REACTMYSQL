import react, { useEffect, useState } from 'react'
import './App.css'
import toast from 'react-hot-toast'
import { FaEdit, FaCheck, FaBan } from "react-icons/fa";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { Formik, Form, Field, ErrorMessage, useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { FaSortDown } from "react-icons/fa";
import { format } from 'date-fns';
import Swal from "sweetalert2";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

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

  // FOR ADD USER
  const [previewImage, setPreviewImage] = useState(null);
  const userForm = useFormik({
    initialValues: {
      userName: "",
      userEmail: "",
      userPassword: "",
      userMobile: "",
      userPopular: 0,
      userSortBy: 0,
      userStatus: 0,
      userImage: null,
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
      userImage: Yup.mixed().required("Image is required"),
    }),
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("userName", values.userName);
      formData.append("userEmail", values.userEmail);
      formData.append("userPassword", values.userPassword);
      formData.append("userMobile", values.userMobile);
      formData.append("userPopular", values.userPopular);
      formData.append("userSortBy", values.userSortBy);
      formData.append("userStatus", values.userStatus);
      formData.append("userImage", values.userImage); // Append image
      formData.append("userCreatedAt", Math.floor(Date.now() / 1000)); // Add current UNIX timestamp


      try {
        const res = await fetch('http://localhost:8001/api/users', {
          method: "POST",
          body: formData,
          // headers: {
          //   "Content-Type": "application/json",
          // },
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
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      userForm.setFieldValue("userImage", file); // Set image in Formik
    }
  };

  // FOR EDIT USER
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    userMobile: "",
    userPopular: 0,
    userStatus: 0,
  });

  const fetchUserData = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8001/api/users/${id}`);
      setUser(response.data);
      setFormData({
        userName: response.data.userName,
        userEmail: response.data.userEmail,
        userMobile: response.data.userMobile,
        userPassword: response.data.userPassword,
        userPopular: response.data.userPopular,
        userStatus: response.data.userStatus,
      });
      setEditMode(true);

      // Show the edit tab by triggering the click event
      document.getElementById("editUser-styled-tab").click();

    } catch (error) {
      toast.error("Error fetching user data:", error);
    }
  };



  const [errors, setErrors] = useState({}); // State for validation errors


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.userName.trim()) {
      newErrors.userName = "Name is required.";
    }
    if (!formData.userEmail.trim()) {
      newErrors.userEmail = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)) {
      newErrors.userEmail = "Invalid email format.";
    }
    if (!formData.userMobile.trim()) {
      newErrors.userMobile = "Mobile number is required.";
    } else if (!/^\d{10}$/.test(formData.userMobile)) {
      newErrors.userMobile = "Mobile number must be 10 digits.";
    }
    if (!formData.userPopular.toString().trim()) {
      newErrors.userPopular = "Please select Popularity.";
    }
    if (!formData.userStatus.toString().trim()) {
      newErrors.userStatus = "Please select Status.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  const handleUpdateUser = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      await axios.put(`http://localhost:8001/api/users/${user.userId}`, formData);
      // setEditMode(false);
      toast.success("User updated successfully!");

      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000); // 2-second delay to let the notification show
    } catch (error) {
      toast.error("Error updating user:", error);
    }
  };

  //FOR DELETE USER
  const handleDelete = (userId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        // Send request to update the user's status to 3
        fetch(`http://localhost:8001/users/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userStatus: 3 }),
        })
          .then((response) => {
            if (response.ok) {
              toast.success("The user has been deleted Successfully!.");
              // Instead of reloading the page, just refresh data
              fetch('http://localhost:8001/users')
                .then((res) => res.json())
                .then((updatedData) => setData(updatedData))
                .catch((err) => console.error("Error refreshing data:", err));
            } else {
              toast.error("Failed to delete the user.");
            }
          })
          .catch(() => {
            toast.error("An error occurred while deleting the user.");
          });
      }
    });
  };

  // VIEW USER DATA OPENING MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fetchUser = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8001/api/users/${id}`);
      setUser(response.data);
      setFormData({
        userName: response.data.userName,
        userEmail: response.data.userEmail,
        userMobile: response.data.userMobile,
        userPassword: response.data.userPassword,
        userPopular: response.data.userPopular,
        userStatus: response.data.userStatus,
      });
      setIsModalOpen(true); // Open modal      
    } catch (error) {
      toast.error("Error fetching user data:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditMode(false);
    setUser(null);
  };


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
          <li className={`me-2 editTabBtn ${editMode ? "" : "hidden"}`} role="presentation">
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
                <th>Image</th>
                <th>Name</th>
                <th>Email</th>
                <th>Password</th>
                <th>Mobile</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Popular</th>
                <th>Sort By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(user => (
                <tr key={user.userId}>
                  <td>{data.indexOf(user) + 1}</td>
                  <td>{user.userId}</td>
                  <td>
                  <Zoom>
                    <img src={`http://localhost:8001${user.userImage}`} alt="User Image" className='h-20 w-20' />
                    </Zoom>
                  </td>

                  <td className='cursor-pointer hover:text-blue-500'
                    onClick={() => fetchUser(user.userId)}>
                    {user.userName}
                  </td>
                  <td>{user.userEmail}</td>
                  <td>{user.userPassword}</td>
                  <td>{user.userMobile}</td>
                  <td>
                    {user.userCreatedAt
                      ? format(new Date(user.userCreatedAt * 1000), 'dd MMM yyyy hh:mm (EEE)', { timeZone: 'Asia/Kolkata' })
                      : "N/A"}
                  </td>
                  <td>
                    {user.userUpdatedAt
                      ? format(new Date(user.userUpdatedAt * 1000), 'dd MMM yyyy hh:mm (EEE)', { timeZone: 'Asia/Kolkata' })
                      : "N/A"}
                  </td>
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
                  <td>
                    <Menu as="div" className="relative inline-block text-left">
                      <div>
                        <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                          Action
                          <FaSortDown aria-hidden="true" className="-mr-1 -mt-1 size-5 text-gray-400" />
                        </MenuButton>
                      </div>

                      <MenuItems
                        transition
                        className="absolute right-0 z-10 mt-2 w-24 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                      >
                        <div className="py-1">
                          <MenuItem>
                            <button
                              onClick={() => fetchUserData(user.userId)} // Replace 1 with the desired userId
                              className="block px-4 py-2 text-sm text-gray-700"
                            >
                              Edit
                            </button>
                          </MenuItem>
                          <MenuItem>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleDelete(user.userId);
                              }}
                              className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                            >
                              Delete
                            </button>
                          </MenuItem>

                        </div>
                      </MenuItems>
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ADD FORM */}
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
                  // value={userForm.values.userName}
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
                  // value={userForm.values.userEmail}
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
                  // value={userForm.values.userPassword}
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
                  // value={userForm.values.userMobile}
                  maxLength={10}
                  className="w-full p-2 border rounded"
                />
                {userForm.touched.userMobile && userForm.errors.userMobile && (
                  <div className="text-red-500 text-sm">{userForm.errors.userMobile}</div>
                )}
              </div>
              <div>
                <label htmlFor="userImage">Upload Image</label>
                <input
                  type="file"
                  id="userImage"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {userForm.touched.userImage && userForm.errors.userImage && (
                  <div>{userForm.errors.userImage}</div>
                )}
                {previewImage && (
                  <div>
                    <img src={previewImage} alt="Preview" width="100" height="100" />
                  </div>
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
                  // value={userForm.values.userPopular}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="" disabled>Select Popular</option>
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
                  // value={userForm.values.userStatus}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="" disabled>Select Status</option>
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

        {/* EDIT FORM */}
        <div className="hidden p-4 rounded-lg bg-gray-50 " id="styled-editUser" role="tabpanel" aria-labelledby="editUser-tab">
          {editMode && (
            <div id="styled-editUser">
              <form className="p-4 border rounded-lg">
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">Name</label>
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                  {errors.userName && (
                    <p className="text-red-500 text-sm">{errors.userName}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">Email</label>
                  <input
                    type="email"
                    name="userEmail"
                    value={formData.userEmail}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                  {errors.userEmail && (
                    <p className="text-red-500 text-sm">{errors.userEmail}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">Password</label>
                  <input
                    type="text"
                    name="userPassword"
                    value={formData.userPassword}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                  {errors.userPassword && (
                    <p className="text-red-500 text-sm">{errors.userPassword}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">Mobile</label>
                  <input
                    type="tel"
                    name="userMobile"
                    value={formData.userMobile}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                  {errors.userMobile && (
                    <p className="text-red-500 text-sm">{errors.userMobile}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">Popular</label>
                  <select
                    name="userPopular"
                    value={formData.userPopular}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="" selected disabled>Select Popularity</option>
                    <option value={0}>Popular</option>
                    <option value={1}>Not Popular</option>
                  </select>
                  {errors.userPopular && (
                    <p className="text-red-500 text-sm">{errors.userPopular}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">Status</label>
                  <select
                    name="userStatus"
                    value={formData.userStatus}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="" selected disabled>Select Status</option>
                    <option value={0}>Active</option>
                    <option value={1}>Inactive</option>
                  </select>
                  {errors.userStatus && (
                    <p className="text-red-500 text-sm">{errors.userStatus}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleUpdateUser}
                  className="px-4 py-2 text-white bg-blue-500 rounded"
                >
                  Update
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Modal For View User */}
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <button className="close-button" onClick={closeModal}>
                &times;
              </button>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">User Details</h2>
              <form className="grid grid-cols-1 gap-4">
                {/* Name */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1">Name:</label>
                  <input
                    type="text"
                    value={formData.userName}
                    readOnly
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1">Email:</label>
                  <input
                    type="email"
                    value={formData.userEmail}
                    readOnly
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Mobile */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1">Mobile:</label>
                  <input
                    type="tel"
                    value={formData.userMobile}
                    readOnly
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1">Password:</label>
                  <input
                    type="text"
                    value={formData.userPassword}
                    readOnly
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Popular */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1">Popular:</label>
                  <input
                    type="text"
                    value={formData.userPopular == 0 ? "Yes" : "No"}
                    readOnly
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1">Status:</label>
                  <input
                    type="text"
                    value={formData.userStatus == 0 ? "Active" : "Inactive"}
                    readOnly
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </form>

            </div>
          </div>
        )}

      </div >


    </>
  )
}

export default App
