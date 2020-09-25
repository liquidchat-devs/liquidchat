module.exports = {
    addUser(db, user) {
        if(db.DEBUG) {
            console.log(" - [db] Adding User(id: " + user.id + ") into the database..."); 
        }

        var query = "INSERT IGNORE INTO users (id, username, createdAt, avatar, password) VALUES('" + user.id + "', '" + user.username + "', " + user.createdAt + ", '" + user.avatar + "', '" + user.password + "')";
        db.sqlConn.promise().query(query)
        .then((result, err) => {
            if(err) { throw err; }
        });
    },

    addChannel(db, channel) {
        if(db.DEBUG) {
            console.log(" - [db] Adding Channel(id: " + channel.id + ") into the database..."); 
        }

        var query = "INSERT IGNORE INTO channels (id, name, type, createdAt, authorID) VALUES('" + channel.id + "', '" + channel.name + "', "+ channel.type + ", " + channel.createdAt + ", '" + channel.author.id + "')";
        db.sqlConn.promise().query(query)
        .then((result, err) => {
            if(err) { throw err; }
        });
    },

    addMessage(db, message) {
        if(db.DEBUG) {
            console.log(" - [db] Adding Message(id: " + message.id + ") into the database..."); 
        }

        var query0 = "(id" + (message.text == null ? "" : ", text") + ", createdAt, authorID, channelID, edited" + (message.file == null ? ")" : ", fileName, fileSize)")
        var query1 = "('" + message.id + "'" + (message.text == null ? "" : ", '" + message.text + "'") + ", " + message.createdAt + ", '" + message.author.id + "', '" + message.channel.id + "', " + message.edited + (message.file == null ? ")" : ", '" + message.file.name + "', " + message.file.size + ")")
        console.log(query0)
        console.log(query1)
        var query = "INSERT IGNORE INTO messages " + query0 + " VALUES" + query1;
        db.sqlConn.promise().query(query)
        .then((result, err) => {
            if(err) { throw err; }
        });
    }
}