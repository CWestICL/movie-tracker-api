const express = require("express");
const router = express.Router();
const {check,validationResult} = require("express-validator");
const {User,Show} = require("../models");
const {logTable} = require('sequelize-logger');
const {db} = require('../db');

router.get("/", async (req,res) => {
    console.log("GET request for users");
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
    console.log("GET request for user ID " + req.params.id);
    let findUser = await User.findByPk(req.params.id,{include: Show});
    if (!findUser) {
        console.log("Error: No user with ID " + req.params.id + " found");
        res.status(404).send("No user with ID " + req.params.id + " found");
    }
    else {
        let payload = {
            id: findUser.id,
            name: findUser.name,
            showsAttended: findUser.shows.length
        };
        console.log("User with ID " + req.params.id + " found");
        res.send(payload);
    }
});

router.get("/:id/shows", async (req,res) => {
    console.log("GET request for shows tied to user ID " + req.params.id);
    let findUser = await User.findByPk(req.params.id,{include: Show});
    if (!findUser) {
        console.log("Error: No user with ID " + req.params.id + " found");
        res.status(404).send("No user with ID " + req.params.id + " found");
    }
    else if (findUser.shows.length < 1) {
        console.log("Error: No shows tied to user ID " + req.params.id);
        res.status(404).send("No shows tied to user ID " + req.params.id);
    }
    else {
        let payload = [];
        for (let show of findUser.shows) {
            payload.push(show.title);
        }
        console.log("Shows tied to user with ID " + req.params.id + " found");
        res.send(payload);
    }
});

router.post("/",[
    check("name").trim().not().isEmpty().withMessage('name must have content')
], async (req,res) => {
    console.log("POST request for new user");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("Error: Invalid data submitted");
        return res.status(400).send({error: errors.array()});
    }
    let newUser = req.body;
    await User.create({
        name: newUser.name
    });
    console.log("Created user: " + newUser.name);
    await logTable(User);
    let allUsers = await User.findAll();
    res.status(202).send(allUsers);
});

router.put("/:id",[
    check("name").trim().not().isEmpty().withMessage('name must have content')
], async (req,res) => {
    console.log("PUT request for user ID " + req.params.id);
    const errors = validationResult(req);
    let findUser = await User.findByPk(req.params.id,{include: Show});
    if (!findUser) {
        console.log("Error: No user with ID " + req.params.id + " found");
        res.status(404).send("No user with ID " + req.params.id + " found");
    }
    else if (!errors.isEmpty()) {
        console.log("Error: Invalid data submitted");
        return res.status(400).send({error: errors.array()});
    }
    else {
        let updateUser = req.body;
        await findUser.update({
            name: updateUser.name
        });
        console.log("Updated name of user ID " + req.params.id + " to '" + updateUser.name + "'");
        await logTable(User);
        findUser = await User.findByPk(req.params.id,{include: Show});
        let payload = {
            id: findUser.id,
            name: findUser.name,
            numberOfShows: findUser.shows.length
        };
        res.status(202).send(payload);
    }
});

router.put("/:id/attend/:show", async (req,res) => {
    console.log("PUT request to link user ID " + req.params.id + " with show ID " + req.params.show);
    let user = await User.findByPk(req.params.id);
    let show = await Show.findByPk(req.params.show);
    if (!user) {
        console.log("Error: No user with ID " + req.params.id + " found");
        res.status(404).send("No user with ID " + req.params.id + " found");
    }
    if (!show) {
        console.log("Error: No show with ID " + req.params.show + " found");
        res.status(404).send("No show with ID " + req.params.show + " found");
    }
    await user.addShow(show);
    console.log("Linked user " + user.name + " and " + show.title);
    await logTable(db.models.user_show);
    res.status(202).send("Linked user " + user.name + " with show " + show.title);
});

router.delete("/:id", async (req,res) => {
    console.log("DELETE request for user ID " + req.params.id);
    let findUser = await User.findByPk(req.params.id);
    if (!findUser) {
        console.log("Error: No user with ID " + req.params.id + " found");
        res.status(404).send("No user with ID " + req.params.id + " found");
    }
    else {
        await findUser.destroy();
        console.log("Deleted user with ID " + req.params.id);
        await logTable(User);
        let allUsers = await User.findAll();
        res.status(202).send(allUsers);
    }
});

module.exports = router;