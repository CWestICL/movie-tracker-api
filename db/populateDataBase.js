const {db} = require('.')
const {userData,showData} = require('./seedData');
const {User,Show} = require('../models')


let populateDataBase = async () => {
    await db.sync({ force: true });
    await Promise.all(userData.map((c) => {User.create(c)}));
    await Promise.all(showData.map((c) => {Show.create(c)}));
    let u1 = await User.findByPk(1);
    let u2 = await User.findByPk(2);
    let s1 = await Show.findByPk(1);
    let s2 = await Show.findByPk(2);
    let s3 = await Show.findByPk(3);
    await u1.addShow(s1);
    await u1.addShow(s3);
    await u2.addShow(s1);
    await u2.addShow(s2);
};

let buildDB = async () => {
    await populateDataBase();
}

module.exports = {buildDB}