const express = require("express");
const router = express.Router();
const {check,validationResult} = require("express-validator");
const {User,Show} = require("../models");
const {logTable} = require('sequelize-logger');

router.get("/", async (req,res) => {
    console.log("GET request for shows");
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

router.get("/:id", async (req,res) => {
    console.log("GET request for show ID " + req.params.id);
    let findShow = await Show.findByPk(req.params.id,{include: User});
    if (!findShow) {
        console.log("Error: No show with ID " + req.params.show + " found");
        res.status(404).send("No show with ID " + req.params.show + " found");
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
        console.log("Show with ID " + req.params.id + " found");
        res.send(payload);
    }
});

router.post("/",[
    check("title").trim().not().isEmpty().withMessage('title must have content'),
    check("genre").trim().not().isEmpty().withMessage('genre must have content'),
    check("status").trim().not().isEmpty().withMessage('status must have content'),
    check("rating").isInt().withMessage('rating must be a integer number')
], async (req,res) => {
    console.log("POST request for new show");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("Error: Invalid data submitted");
        return res.status(400).send({error: errors.array()});
    }
    let newShow = req.body;
    await Show.create({
        title: newShow.title,
        genre: newShow.genre,
        status: newShow.status,
        rating: newShow.rating,
    });
    console.log("Created show: " + newShow.title);
    await logTable(Show);
    let allShows = await Show.findAll();
    res.status(202).send(allShows);
});

router.put("/:id",[
    check("title").trim().optional().not().isEmpty().withMessage('title must have content'),
    check("genre").trim().optional().not().isEmpty().withMessage('genre must have content'),
    check("status").trim().optional().not().isEmpty().withMessage('status must have content'),
    check("rating").optional().isInt().withMessage('rating must be a integer number')
], async (req,res) => {
    console.log("PUT request for show ID " + req.params.id);
    const errors = validationResult(req);
    let findShow = await Show.findByPk(req.params.id,{include: User});
    if (!findShow) {
        console.log("Error: No show with ID " + req.params.show + " found");
        res.status(404).send("No show with ID " + req.params.show + " found");
    }
    else if (!errors.isEmpty()) {
        console.log("Error: Invalid data submitted");
        return res.status(400).send({error: errors.array()});
    }
    else {
        let newData = req.body;
        if (newData.title) {
            await findShow.update({
                title: newData.title
            });
        }
        if (newData.genre) {
            await findShow.update({
                genre: newData.genre
            });
        }
        if (newData.status) {
            await findShow.update({
                status: newData.status
            });
        }
        if (newData.rating) {
            await findShow.update({
                rating: newData.rating
            });
        }
        findShow = await Show.findByPk(req.params.id,{include: User});
        let payload = {
            id: findShow.id,
            title: findShow.title,
            genre: findShow.genre,
            rating: findShow.rating,
            status: findShow.status,
            audience: findShow.users.length
        };
        console.log("Updated data of show ID " + req.params.id);
        await logTable(Show);
        res.send(payload);
    }
});

router.delete("/:id", async (req,res) => {
    console.log("DELETE request for show ID " + req.params.id);
    let findShow = await Show.findByPk(req.params.id);
    if (!findShow) {
        console.log("Error: No show with ID " + req.params.show + " found");
        res.status(404).send("No show with ID " + req.params.show + " found");
    }
    else {
        console.log("Deleting show:",findShow.title)
        findShow.destroy();
        await logTable(Show);
        res.status(202).send("Deleted show with ID " + req.params.id);
    }
});

module.exports = router;