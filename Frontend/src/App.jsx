import react, { useEffect, useState } from 'react'
import './App.css'
import toast from 'react-hot-toast'

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
      .catch((err) =>toast.error('Error updating status:', err));
        //  console.error('Error updating status:', err));

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
              <th>Id</th>
              <th>Name</th>
              <th>Email</th>
              <th>Password</th>
              <th>Mobile</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map(user => (
              <tr key={user.userId}>
                <td>{user.userId}</td>
                <td>{user.userName}</td>
                <td>{user.userEmail}</td>
                <td>{user.userPassword}</td>
                <td>{user.userMobile}</td>
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
