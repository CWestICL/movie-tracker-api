const {DataTypes, db} = require('../db');

const Show = db.define("show", {
    title: DataTypes.STRING,
    genre: DataTypes.STRING,
    rating: DataTypes.INTEGER,
    status: DataTypes.STRING
});

module.exports = {Show};