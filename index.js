import express from "express";
import dotenv from "dotenv";
import fs, { stat } from "fs";
import { createRequire } from "module";
import { json } from "stream/consumers";
const require = createRequire(
    import.meta.url);

const users = require("./MOCK_DATA.json");


dotenv.config()

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ extended: false }))

app.get("/", (req, res) => (
    res.send("Server is working")
))

app.get("/api/users", (req, res) => {
    res.json(users)
})

// Dynamic ID
app
    .route("/api/users/:id")
    .get((req, res) => { // Get Request
        const id = Number(req.params.id);
        const user = users.find((user) => user.id === id);
        return res.json(user);
    })
    .patch((req, res) => { // Patch Request
        // Patch user with id
        const userId = parseInt(req.params.id);
        const user = users.find(u => u.id === userId);
        const updates = req.body;

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        for (let key in updates) {
            if (user[key] !== undefined) {
                user[key] = updates[key];
            }
        }
        fs.writeFileSync("./MOCK_DATA.json", JSON.stringify(users, null, 2))
        res.json(user);
    }).put((req, res) => {
        // Put Request
        const userId = parseInt(req.params.id);
        const newUserData = req.body;
        const index = users.findIndex(u => u.id === userId);

        if (index === -1) {
            return res.status(404).json({
                message: `User with id ${userId} not found`
            });
        }

        users[index] = {
            ...newUserData,
            id: userId
        }

        fs.writeFileSync(
            "./MOCK_DATA.json",
            JSON.stringify(users, null, 2)
        )

        return res.json({
            status: "updated",
            user: users[index]
        });
    })
    .delete((req, res) => { // Delete Request
        // Delete user with id
        const userId = parseInt(req.params.id);
        const index = users.findIndex(u => u.id === userId);

        if (index === -1) {
            return res.status(404).json({
                message: `User with id ${userId} not found`
            });
        }

        const deletedUser = users.splice(index, 1);

        fs.writeFileSync(
            "./MOCK_DATA.json",
            JSON.stringify(users, null, 2)
        )

        return res.json({
            status: "success",
            user: deletedUser
        })
    })

app.post("/api/users", (req, res) => {
    const body = req.body;
    users.push({...body, id: users.length + 1 });
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, data) => {
        return res.json({ status: "success", id: users.length })
    })

})

app.listen(PORT, () => {
    console.log("Server is running", PORT);
})