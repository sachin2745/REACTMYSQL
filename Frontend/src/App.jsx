import react, { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [data, setData] = useState([])


  useEffect(() => {
    fetch('http://localhost:8001/users')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.log(err))
  }, [])

  return (
    <>
     
      <div>
        <h1>Users</h1>
        <table>
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
              <tr key={user.id}>
                <td>{user.userId}</td>
                <td>{user.userName}</td>
                <td>{user.userEmail}</td>
                <td>{user.userPassword}</td>
                <td>{user.userMobile}</td>
                <td>{user.userStatus === 0 ? "Active" : "Inactive"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default App
