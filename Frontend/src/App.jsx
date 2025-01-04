import react, { useEffect, useState } from 'react'
import './App.css'
import toast from 'react-hot-toast'
import { FaEdit, FaCheck, FaBan } from "react-icons/fa";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";


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

  return (
    <>
      <div>
        <table className="table-auto border-separate ">
          <caption className="caption-top text-xl font-semibold mb-5">
            USERS
          </caption>
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
    </>
  )
}

export default App
