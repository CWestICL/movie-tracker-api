const express = require("express");
const router = express.Router();
const {check,validationResult} = require("express-validator");
const {User,Show} = require("../models");
const {logTable} = require('sequelize-logger');

router.get("/", async (req,res) => {
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

router.put("/:id/status",[check("status").trim().not().isEmpty().withMessage('status must have content')], async (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({error: errors.array()});
    }
    let findShow = await Show.findByPk(req.params.id);
    let newStatus = req.body;
    if (!findShow) {
        res.status(404).send("No show with that ID found");
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

router.put("/:id/rating",[check("rating").isInt().withMessage('rating must be a integer number')], async (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({error: errors.array()});
    }
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

router.delete("/:id", async (req,res) => {
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

module.exports = router;