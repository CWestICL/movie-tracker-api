const {db} = require('.')
const {userData,showData} = require('./seedData');
const {User,Show} = require('../models')


let populateDataBase = async () => {
    await db.sync({ force: true });
    await Promise.all(userData.map((c) => {User.create(c)}));
    await Promise.all(showData.map((c) => {Show.create(c)}));
};

let buildDB = async () => {
    await populateDataBase();
}

module.exports = {buildDB}