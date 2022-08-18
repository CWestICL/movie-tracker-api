const {User} = require('./User');
const {Show} = require('./Show');

User.belongsToMany(Show, {through: "user_show"});
Show.belongsToMany(User, {through: "user_show"});

module.exports = {
    User,
    Show
};