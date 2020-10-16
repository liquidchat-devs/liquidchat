module.exports = {
    addServer(db, server) {
        if(db.DEBUG) {
            console.log(" - [db] Adding Server(id: " + server.id + ") into the database..."); 
        }

        var query = "INSERT IGNORE INTO servers (id, name, createdAt, authorID, avatar, channels, members, invites) VALUES" + db.contructQuestionMarks(8);
        db.sqlConn.promise().execute(query, [ server.id, db.escapeString(server.name), server.createdAt,  server.author.id, server.avatar, server.channels.join(","), server.members.join(","), server.invites.join(",") ])
        .then((result, err) => {
            if(err) { throw err; }
        });
    },
    
    addUser(db, user) {
        if(db.DEBUG) {
            console.log(" - [db] Adding User(id: " + user.id + ") into the database..."); 
        }

        var query = "INSERT IGNORE INTO users (id, username, createdAt, avatar, password, friends, dmChannels, servers, status) VALUES" + db.contructQuestionMarks(9);
        db.sqlConn.promise().execute(query, [ user.id, db.escapeString(user.username), user.createdAt, user.avatar, user.password, user.friends.join(","), user.dmChannels.join(","), user.servers.join(","), user.status ])
        .then((result, err) => {
            if(err) { throw err; }
        });
    },

    addChannel(db, channel) {
        if(db.DEBUG) {
            console.log(" - [db] Adding Channel(id: " + channel.id + ") into the database..."); 
        }

        var query0 = "(id, name, type, createdAt, authorID" + (channel.position == null ? "" : ", position") + (channel.members == null ? "" : ", members") + (channel.server == null ? ")" : ", serverID)")
        var query1 = [ channel.id, db.escapeString(channel.name), channel.type, channel.createdAt, channel.author.id ]
        if(channel.position != null) { query1.push(channel.position) }
        if(channel.members != null) { query1.push(channel.members.join(",")) }
        if(channel.server != null) { query1.push(channel.server.id) }

        var query = "INSERT IGNORE INTO channels " + query0 + " VALUES" + db.contructQuestionMarks(query1.length);
        db.sqlConn.promise().execute(query, query1)
        .then((result, err) => {
            if(err) { throw err; }
        });
    },

    addMessage(db, message) {
        if(db.DEBUG) {
            console.log(" - [db] Adding Message(id: " + message.id + ") into the database..."); 
        }

        var query0 = "(id, createdAt, channelID, edited, type" + (message.text == null ? "" : ", text") + (message.author == null ? "" : ", authorID") + (message.file == null ? ")" : ", fileName, fileSize)")
        var query1 = [ message.id, message.createdAt, message.channel.id, message.edited, message.type ]
        if(message.text != null) { query1.push(db.escapeString(message.text)) }
        if(message.author != null) { query1.push(message.author.id) }
        if(message.file != null) { query1.push(db.escapeString(message.file.name), message.file.size) }
        
        var query = "INSERT IGNORE INTO messages " + query0 + " VALUES" + db.contructQuestionMarks(query1.length);
        db.sqlConn.promise().execute(query, query1)
        .then((result, err) => {
            if(err) { throw err; }
        });
    },

    addFriendRequest(db, friendRequest) {
        if(db.DEBUG) {
            console.log(" - [db] Adding FriendRequest(id: " + friendRequest.id + ") into the database..."); 
        }
        
        var query = "INSERT IGNORE INTO friendRequests (id, authorID, targetID, createdAt) VALUES('" + friendRequest.id + "', '" + friendRequest.author.id + "', '" + friendRequest.target.id + "', " + friendRequest.createdAt + ")";
        db.sqlConn.promise().query(query)
        .then((result, err) => {
            if(err) { throw err; }
        });
    },

    addInvite(db, invite) {
        if(db.DEBUG) {
            console.log(" - [db] Adding Invite(id: " + invite.id + ") into the database..."); 
        }
        
        var query = "INSERT IGNORE INTO invites (id, authorID, serverID, createdAt) VALUES('" + invite.id + "', '" + invite.author.id + "', '" + invite.server.id + "', " + invite.createdAt + ")";
        db.sqlConn.promise().query(query)
        .then((result, err) => {
            if(err) { throw err; }
        });
    },

    addEmote(db, emote) {
        if(db.DEBUG) {
            console.log(" - [db] Adding Emote(id: " + emote.id + ") into the database..."); 
        }

        var query0 = "(id, name, createdAt, authorID, file, type" + (emote.server == null ? ")" : ", serverID)")
        var query1 = [ emote.id, emote.name, emote.createdAt, emote.author.id, emote.file, emote.type ]
        if(emote.server != null) { query1.push(db.escapeString(emote.server.id)) }

        var query = "INSERT IGNORE INTO emotes " + query0 + " VALUES" + db.contructQuestionMarks(query1.length);
        db.sqlConn.promise().execute(query, query1)
        .then((result, err) => {
            if(err) { throw err; }
        });
    },
}