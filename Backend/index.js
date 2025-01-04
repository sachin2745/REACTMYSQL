const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Create a connection to the database
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "test"
})

app.get('/', (req, res) => {
    return res.json("From Backend Side");
})

// Get all users
app.get('/users', (req, res) => {
    const sql = "SELECT * FROM users ORDER BY userSortBy ASC";
    db.query(sql, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    })
})

// Update user status
// app.put('/users/:id', (req, res) => {
//     // console.log('Request Body:', req.body); // Debug request body
//     const { id } = req.params;
//     const { userStatus } = req.body;

//     if (userStatus == undefined) {
//         res.status(400).send('Invalid request: userStatus is required');
//         return;
//     }

//     const sql = 'UPDATE users SET userStatus = ? WHERE userId = ?';
//     db.query(sql, [userStatus, id], (err, result) => {
//         if (err) {
//             console.error('Error updating user status:', err);
//             res.status(500).send('Error updating user status');
//             return;
//         }
//         if (result.affectedRows == 0) {
//             res.status(404).send('User not found');
//             return;
//         }
//         res.send('User status updated successfully');
//     });
// });

// Route to update userPopular status
app.put('/users/:id/popular', (req, res) => {
    const userId = req.params.id;
    const { userPopular } = req.body;

    db.query('UPDATE users SET userPopular = ? WHERE userId = ?',
        [userPopular, userId], (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send('Error updating user popularity status.');
            } else {
                res.status(200).send('User popularity status updated successfully.');
            }
        }
    );
});


// Update User Status And Sort By Value In Users
app.put("/users/:id", (req, res) => {
    const userId = req.params.id;
    const { userSortBy, userStatus } = req.body;

    let query = "";
    const params = [];

    if (userSortBy !== undefined) {
        query = "UPDATE users SET userSortBy = ? WHERE userId = ?";
        params.push(userSortBy, userId);
    } else if (userStatus !== undefined) {
        query = "UPDATE users SET userStatus = ? WHERE userId = ?";
        params.push(userStatus, userId);
    }

    db.query(query, params, (err, result) => {
        if (err) {
            console.error("Error updating user:", err);
            res.status(500).send("Error updating user.");
        } else if (result.affectedRows === 0) {
            res.status(404).send("User not found.");
        } else {
            res.status(200).send("User updated successfully.");
        }
    });
});


app.listen(8001, () => {
    console.log("Server is running on port 8001");
})