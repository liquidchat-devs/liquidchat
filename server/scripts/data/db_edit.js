module.exports = {
    editServer(db, server) {
        if(db.DEBUG) {
            console.log(" - [db] Editing Server(id: " + server.id + ") in the database..."); 
        }

        var query0 = "name=?, avatar=?, channels=?, members=?, emotes=?"
        var query = "UPDATE servers SET " + query0 + " WHERE id='" + server.id + "'";
        db.sqlConn.promise().execute(query, [ db.escapeString(server.name), server.avatar, server.channels.join(","), server.members.join(","), server.emotes.join(",") ])
        .then((result, err) => {
            if(err) { throw err; }
        });
    },

    editUser(db, user) {
        if(db.DEBUG) {
            console.log(" - [db] Editing User(id: " + user.id + ") in the database..."); 
        }

        var query0 = "username=?, avatar=?, friends=?, dmChannels=?, servers=?, status=?, badges=?, emotes=?" + (user.email == null ? "" : ", email=?") + (user.password == null ? "" : ", password=?") + (user.customStatus == null || user.customStatus.length < 1 ? "" : ", customStatus=?")
        var query1 = [ db.escapeString(user.username), user.avatar, user.friends.join(","), user.dmChannels.join(","), user.servers.join(","), user.status, user.badges.join(","), user.emotes.join(",") ]
        if(user.email != null) { query1.push(db.escapeString(user.email)); }
        if(user.password != null) { query1.push(user.password); }
        if(user.customStatus != null) { if(user.customStatus.length < 1) { this.clearUserStatus(db, user); } else { query1.push(user.customStatus); } }

        var query = "UPDATE users SET " + query0 + " WHERE id='" + user.id + "'";
        db.sqlConn.promise().execute(query, query1)
        .then((result, err) => {
            if(err) { throw err; }
        });
    },

    clearUserStatus(db, user) {
        db.sqlConn.promise().query("UPDATE users SET customStatus=NULL WHERE id='" + user.id + "'")
        .then((result, err) => {
            if(err) { throw err; }
        });
    },
    
    editMessage(db, message) {
        if(db.DEBUG) {
            console.log(" - [db] Editing Message(id: " + message.id + ") in the database..."); 
        }

        var query0 = "edited=?, type=?" + (message.text == null ? "" : ", text=?") + (message.file == null ? "" : ", fileName=?, fileSize=?")
        var query1 = [ message.edited, message.type ]
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

        var query0 = "name=?, nsfw=?" + (channel.position == null ? "" : ", position=?") + (channel.members == null ? "" : ", members=?") + (channel.description == null ? "" : ", description=?")
        var query1 = [ db.escapeString(channel.name), channel.nsfw ]
        if(channel.position != null) { query1.push(channel.position); }
        if(channel.members != null) { query1.push(channel.members.join(",")); }
        if(channel.description != null) { query1.push(channel.description); }

        var query = "UPDATE channels SET " + query0 + " WHERE id='" + channel.id + "'";
        db.sqlConn.promise().execute(query, query1)
        .then((result, err) => {
            if(err) { throw err; }
        });
    }
}