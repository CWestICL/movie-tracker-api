const express = require("express");
const router = express.Router();
const {check,validationResult} = require("express-validator");
const {User,Show} = require("../models");
const {logTable} = require('sequelize-logger');
const {db} = require('../db');

router.get("/", async (req,res) => {
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

router.get("/:id", async (req,res) => {
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

router.get("/:id/shows", async (req,res) => {
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

router.put("/attend",[
    check("userID").isInt().withMessage('userID must be a integer number'),
    check("showID").isInt().withMessage('showID must be a integer number')
], async (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({error: errors.array()});
    }
    let attendData = req.body;
    let user = await User.findByPk(attendData.userID);
    let show = await Show.findByPk(attendData.showID);
    await user.addShow(show);
    console.log("Linked user",user.name,"and",show.title);
    await logTable(db.models.user_show);
    res.status(202).send("Linked user " + user.name + " and " + show.title);
});

module.exports = router;