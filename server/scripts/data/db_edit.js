module.exports = {
    editServer(db, server) {
        if(db.DEBUG) {
            console.log(" - [db] Editing Server(id: " + server.id + ") in the database..."); 
        }

        var query0 = "name=?, avatar=?, channels=?, members=?, emotes=?" + (server.banner == null ? "" : ", banner=?")
        var query1 = [ db.escapeString(server.name), server.avatar, server.channels.join(","), server.members.join(","), server.emotes.join(",") ]
        if(server.banner != null) { query1.push(server.banner); }

        var query = "UPDATE servers SET " + query0 + " WHERE id='" + server.id + "'";
        db.sqlConn.promise().execute(query, query1)
        .then((result, err) => {
            if(err) { throw err; }
        });
    },

    editUser(db, user) {
        if(db.DEBUG) {
            console.log(" - [db] Editing User(id: " + user.id + ") in the database..."); 
        }

        var query0 = "username=?, avatar=?, friends=?, dmChannels=?, servers=?, userStatus=?, badges=?, emotes=?" + (user.email == null ? "" : ", email=?") + (user.password == null ? "" : ", password=?") + (user.customStatus == null || user.customStatus.length < 1 ? "" : ", customStatus=?")
        + (user.gh_username == null ? "" : ", gh_username=?") + (user.gh_token == null ? "" : ", gh_token=?") + (user.reddit_username == null ? "" : ", reddit_username=?") + (user.reddit_token == null ? "" : ", reddit_token=?")
        + (user.osu_username == null ? "" : ", osu_username=?") + (user.osu_token == null ? "" : ", osu_token=?") + (user.twitch_username == null ? "" : ", twitch_username=?") + (user.twitch_token == null ? "" : ", twitch_token=?")
        + (user.blizzard_username == null ? "" : ", blizzard_username=?") + (user.blizzard_token == null ? "" : ", blizzard_token=?") + (user.spotify_username == null ? "" : ", spotify_username=?") + (user.spotify_token == null ? "" : ", spotify_token=?")
        + (user.discord_username == null ? "" : ", discord_username=?") + (user.discord_token == null ? "" : ", discord_token=?")
        var query1 = [ db.escapeString(user.username), user.avatar, user.friends.join(","), user.dmChannels.join(","), user.servers.join(","), user.userStatus, user.badges.join(","), user.emotes.join(",") ]
        if(user.email != null) { query1.push(db.escapeString(user.email)); }
        if(user.password != null) { query1.push(user.password); }
        if(user.customStatus != null) { if(user.customStatus.length < 1) { this.clearUserStatus(db, user); } else { query1.push(user.customStatus); } }
        if(user.gh_username != null) { query1.push(user.gh_username); }
        if(user.gh_token != null) { query1.push(user.gh_token); }
        if(user.reddit_username != null) { query1.push(user.reddit_username); }
        if(user.reddit_token != null) { query1.push(user.reddit_token); }
        if(user.osu_username != null) { query1.push(user.osu_username); }
        if(user.osu_token != null) { query1.push(user.osu_token); }
        if(user.twitch_username != null) { query1.push(user.twitch_username); }
        if(user.twitch_token != null) { query1.push(user.twitch_token); }
        if(user.blizzard_username != null) { query1.push(user.blizzard_username); }
        if(user.blizzard_token != null) { query1.push(user.blizzard_token); }
        if(user.spotify_username != null) { query1.push(user.spotify_username); }
        if(user.spotify_token != null) { query1.push(user.spotify_token); }
        if(user.discord_username != null) { query1.push(user.discord_username); }
        if(user.discord_token != null) { query1.push(user.discord_token); }

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

    removeUserConnection(db, user, type) {
        db.sqlConn.promise().query("UPDATE users SET " + db.escapeString(type) + "_token=NULL, " + db.escapeString(type) + "_username=NULL WHERE id='" + user.id + "'")
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
    },
    
    editNote(db, note) {
        if(db.DEBUG) {
            console.log(" - [db] Editing Note(id: " + note.id + ") in the database..."); 
        }

        var query0 = "text=?"
        var query1 = [ db.escapeString(note.text) ]

        var query = "UPDATE notes SET " + query0 + " WHERE id='" + note.id + "'";
        db.sqlConn.promise().execute(query, query1)
        .then((result, err) => {
            if(err) { throw err; }
        });
    }
}