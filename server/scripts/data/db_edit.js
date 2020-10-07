module.exports = {
    editServer(db, server) {
        if(db.DEBUG) {
            console.log(" - [db] Editing Server(id: " + server.id + ") in the database..."); 
        }

        var query0 = "name=?, avatar=?, channels=?, members=?"
        var query = "UPDATE servers SET " + query0 + " WHERE id='" + server.id + "'";
        db.sqlConn.promise().execute(query, [ db.escapeString(server.name), server.avatar, server.channels.join(","), server.members.join(",") ])
        .then((result, err) => {
            if(err) { throw err; }
        });
    },

    editUser(db, user) {
        if(db.DEBUG) {
            console.log(" - [db] Editing User(id: " + user.id + ") in the database..."); 
        }

        var query0 = "username=?, avatar=?, friends=?, dmChannels=?, servers=?, status=?" + (user.email == null ? "" : ", email=?") + (user.password == null ? "" : ", password=?")
        var query1 = [ db.escapeString(user.username), user.avatar, user.friends.join(","), user.dmChannels.join(","), user.servers.join(","), user.status ]
        if(user.email != null) { query1.push(db.escapeString(user.email)); }
        if(user.password != null) { query1.push(user.password); }

        var query = "UPDATE users SET " + query0 + " WHERE id='" + user.id + "'";
        db.sqlConn.promise().execute(query, query1)
        .then((result, err) => {
            if(err) { throw err; }
        });
    },
    
    editMessage(db, message) {
        if(db.DEBUG) {
            console.log(" - [db] Editing Message(id: " + message.id + ") in the database..."); 
        }

        var query0 = "edited=?" + (message.text == null ? "" : ", text=?") + (message.file == null ? "" : ", fileName=?, fileSize=?")
        var query1 = [ message.edited ]
        if(message.text != null) { query1.push(db.escapeString(message.text)); }
        if(message.file != null) { query1.push(db.escapeString(message.file.name), message.file.size); }

        var query = "UPDATE messages SET " + query0 + " WHERE id='" + message.id + "'";
        db.sqlConn.promise().execute(query, query1)
        .then((result, err) => {
            if(err) { throw err; }
        });
    },
    
    editChannel(db, channel) {
        if(db.DEBUG) {
            console.log(" - [db] Editing Channel(id: " + channel.id + ") in the database..."); 
        }

        var query0 = "name=?" + (channel.members == null ? "" : ", members=?")
        var query1 = [ db.escapeString(channel.name) ]
        if(channel.members != null) { query1.push(channel.members.join(",")); }

        var query = "UPDATE channels SET " + query0 + " WHERE id='" + channel.id + "'";
        db.sqlConn.promise().execute(query, query1)
        .then((result, err) => {
            if(err) { throw err; }
        });
    }
}