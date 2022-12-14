const {buildDB} = require('./db/populateDataBase')

const express = require("express");
const app = express();
const users = require("./routes/users");
const shows = require("./routes/shows");
const path = require("path");
const port = 3000;

app.use(express.json());
app.use("/users",users);
app.use("/shows",shows);
app.use(express.urlencoded({extended:true}));

app.get("/", (req,res)=> {
    console.log("GET request for app");
    res.status(200).send("Movie Tracker API is online!");
});

async function main() {
    await buildDB();
    app.listen(port, () => {
        console.log("The server is live and listening at http://localhost:" + port);
    });
}

main();