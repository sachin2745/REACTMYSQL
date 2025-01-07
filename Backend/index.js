const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const multer = require('multer');
const fs = require("fs");
const path = require("path");


const app = express();
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

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

// Configure Multer for file uploads
// Dynamic folder storage setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderName = file.fieldname; // Dynamically get folder name from fieldname
        const uploadPath = path.join(__dirname, "static/uploads", folderName);

        // Ensure the folder exists, create it if not
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Set file size limit to 5MB
});
// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "static/uploads")));

// Get all users
app.get('/users', (req, res) => {
    const sql = "SELECT * FROM users WHERE userStatus != 3 ORDER BY userSortBy ASC";
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


// Add user API
app.post("/api/users", upload.single("userImage"), (req, res) => {
    const {
        userName,
        userEmail,
        userPassword,
        userMobile,
        userPopular,
        userStatus,
        userCreatedAt,
    } = req.body;

    const userImage = req.file ? `/uploads/userImage/${req.file.filename}` : null;

    // Step 1: Get the maximum userId and calculate userSortBy
    const getMaxUserIdQuery = `SELECT MAX(userId) AS maxUserId FROM users`;

    db.query(getMaxUserIdQuery, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: "Error fetching max userId" });
        }

        const nextUserId = (result[0].maxUserId || 0) + 1; // If no userId exists, start with 1
        const userSortBy = nextUserId;

        // Step 2: Insert the new user with the calculated userSortBy
        const insertUserQuery = `
          INSERT INTO users (userName, userImage, userEmail, userPassword, userMobile, userPopular, userSortBy, userStatus, userCreatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            insertUserQuery,
            [
                userName,
                userImage,
                userEmail,
                userPassword,
                userMobile,
                userPopular,
                userSortBy, // Dynamically calculated
                userStatus,
                userCreatedAt,
            ],
            (err, result) => {
                if (err) {
                    console.error(err);
                    console.error("Insert Error Details:", err.code, err.sqlMessage, err.sql);
                    return res.status(500).send({ message: "Error inserting user", error: err.sqlMessage });
                }
                res.send({ message: "User added successfully", userId: result.insertId });
            }
        );
    });
});


// Fetch user by ID
app.get("/api/users/:id", (req, res) => {
    const userId = req.params.id;
    const query = "SELECT * FROM users WHERE userId = ?";
    db.query(query, [userId], (err, result) => {
        if (err) throw err;
        res.send(result[0]);
    });
});

// Update user details
app.put("/api/users/:id", upload.single("userImage"), (req, res) => {
    const userId = req.params.id;
    const { userName, userEmail, userPassword, userMobile, userPopular, userStatus } = req.body;
    const userImage = req.file ? `/uploads/userImage/${req.file.filename}` : null;

    let query = `
    UPDATE users
    SET
      userName = ?,
      userEmail = ?,
      userPassword = ?,
      userMobile = ?,
      userPopular = ?,
      userStatus = ?,
      userUpdatedAt = UNIX_TIMESTAMP()
  `;

    const params = [userName, userEmail, userPassword, userMobile, userPopular, userStatus];

    // Update userImage only if a new image is uploaded
    if (userImage) {
        query += `, userImage = ?`;
        params.push(userImage);
    }

    query += ` WHERE userId = ?`;
    params.push(userId);

    db.query(query, params, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: "Error updating user" });
        }
        res.send({ message: "User updated successfully" });
    });
});

app.listen(8001, () => {
    console.log("Server is running on port 8001");
})