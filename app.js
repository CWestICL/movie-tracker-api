const {buildDB} = require('./db/populateDataBase')
const {logTable} = require('sequelize-logger')
const {db} = require('./db');

const express = require("express");
const app = express();
const {User,Show} = require("./models") 
const path = require("path");
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get("/", (req,res)=> {
    res.sendStatus(200);
});

app.get("/users", async (req,res) => {
    let allUsers = await User.findAll();
    let payload = [];
    if (!allUsers) {
        res.status(404).send("No users found");
    }
    else {
        for (let user of allUsers) {
            payload.push(user.name);
        }
        await logTable(User);
        res.send(payload);
    }
});

app.get("/users/:id", async (req,res) => {
    let findUser = await User.findByPk(req.params.id,{include: Show});
    if (!findUser) {
        res.status(404).send("No user with that ID found");
    }
    else {
        let payload = {
            id: findUser.id,
            name: findUser.name,
            numberOfShows: findUser.shows.length
        };
        res.send(payload);
    }
});

app.get("/users/:id/shows", async (req,res) => {
    let findUser = await User.findByPk(req.params.id,{include: Show});
    if (!findUser) {
        res.status(404).send("No user with that ID found");
    }
    else if (findUser.shows.length < 1) {
        res.status(404).send("No shows tied to that user found");
    }
    else {
        let payload = [];
        for (let show of findUser.shows) {
            payload.push(show.title);
        }
        res.send(payload);
    }
});

app.put("/users/attend", async (req,res) => {
    let attendData = req.body;
    if (typeof attendData.userID !== "number" || typeof attendData.showID !== "number") {
        res.status(400).send("Insufficent body data");
    }
    else {
        let user = await User.findByPk(attendData.userID);
        let show = await Show.findByPk(attendData.showID);
        await user.addShow(show);
        console.log("Linked user",user.name,"and",show.title);
        await logTable(db.models.user_show);
        res.status(202).send("Linked user " + user.name + " and " + show.title);
    }
});

app.get("/shows", async (req,res) => {
    let allShows = await Show.findAll();
    let payload = [];
    if (!allShows) {
        res.status(404).send("No shows found");
    }
    else if (req.query.g) {
        for (let show of allShows) {
            if (show.genre.toLowerCase() === req.query.g) {
                payload.push(show.title);
            }
        }
        if (payload.length > 0) {
            res.send(payload);
        }
        else {
            res.status(404).send("No shows with that genre found");
        }
    }
    else {
        for (let show of allShows) {
            payload.push(show.title);
        }
        await logTable(Show);
        res.send(payload);
    }
});

app.get("/shows/:id", async (req,res) => {
    let findShow = await Show.findByPk(req.params.id,{include: User});
    if (!findShow) {
        res.status(404).send("No show with that ID found");
    }
    else {
        let payload = {
            id: findShow.id,
            title: findShow.title,
            genre: findShow.genre,
            rating: findShow.rating,
            status: findShow.status,
            audience: findShow.users.length
        };
        res.send(payload);
    }
});

app.put("/shows/:id/status", async (req,res) => {
    let findShow = await Show.findByPk(req.params.id);
    let newStatus = req.body;
    if (!findShow) {
        res.status(404).send("No show with that ID found");
    }
    else if (typeof newStatus.status !== "string") {
        res.status(400).send("Insufficent body data");
    }
    else {
        await findShow.update({
            status: newStatus.status
        });
        console.log("Updated status of",findShow.title,": '",newStatus.status,"'");
        await logTable(Show);
        res.status(202).send("Updated status of " + findShow.title + ": '" + newStatus.status + "'");
    }
});

app.put("/shows/:id/rating", async (req,res) => {
    let findShow = await Show.findByPk(req.params.id);
    let newRating = req.body;
    if (!findShow) {
        res.status(404).send("No show with that ID found");
    }
    else if (typeof newRating.rating !== "number") {
        res.status(400).send("Insufficent body data");
    }
    else {
        await findShow.update({
            rating: newRating.rating
        });
        console.log("Updated rating of",findShow.title,": '",newRating.rating,"'");
        await logTable(Show);
        res.status(202).send("Updated rating of " + findShow.title + ": '" + newRating.rating + "'");
    }
});

app.delete("/shows/:id", async (req,res) => {
    let findShow = await Show.findByPk(req.params.id);
    if (!findShow) {
        res.status(404).send("No show with that ID found");
    }
    else {
        console.log("Deleting show:",findShow.title)
        findShow.destroy();
        await logTable(Show);
        res.status(202).send("Deleting show: " + findShow.title);
    }
});

async function main() {
    await buildDB();
    app.listen(port, () => {
        console.log("The server is live and listening at http://localhost:" + port);
    });
}

main();