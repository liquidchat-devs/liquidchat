module.exports = {
    async fetchServer(db, id) {
        if(db.DEBUG) {
            console.log(" - [db] Loading Server(id: " + id + ") from the database..."); 
        }

        var query0 = "SELECT * FROM servers WHERE id='" + id + "'";
        var result = await db.sqlConn.promise().query(query0);
        if(result.length < 1 || result[0].length < 1) {
            return undefined;
        }
    
        return this.formatServer(result[0][0]);
    },

    async fetchUser(db, id, containSensitive) {
        if(db.DEBUG) {
            console.log(" - [db] Loading User(id: " + id + ") from the database..."); 
        }

        var query0 = "SELECT * FROM users WHERE id='" + id + "'";
        var result = await db.sqlConn.promise().query(query0);
        if(result.length < 1 || result[0].length < 1) {
            return undefined;
        }
    
        return this.formatUser(result[0][0], containSensitive);
    },

    async fetchUserByUsername(db, username, containSensitive, containPassword) {
        if(db.DEBUG) {
            console.log(" - [db] Loading User(username: " + username + ") from the database..."); 
        }

        var query0 = "SELECT * FROM users WHERE username='" + username + "'";
        var result = await db.sqlConn.promise().query(query0);
        if(result.length < 1 || result[0].length < 1) {
            return undefined;
        }
    
        return this.formatUser(result[0][0], containSensitive, containPassword);
    },

    async fetchChannel(db, id) {
        if(db.DEBUG) {
            console.log(" - [db] Loading Channel(id: " + id + ") from the database..."); 
        }

        var query0 = "SELECT * FROM channels WHERE id='" + id + "'";
        var result = await db.sqlConn.promise().query(query0);
        if(result.length < 1 || result[0].length < 1) {
            return undefined;
        }
    
        return this.formatChannel(result[0][0])
    },

    async fetchChannels(db, serverID) {
        if(db.DEBUG) {
            console.log(" - [db] Loading Channels from the database..."); 
        }

        var query0 = "SELECT * FROM channels WHERE serverID='" + serverID + "'";
        var result = await db.sqlConn.promise().query(query0);
        if(result.length < 1 || result[0].length < 1) {
            return [];
        }

        var res = result[0]
        res.forEach(_res => {
            _res = this.formatChannel(_res)
        });
    
        return res
    },

    async fetchMessage(db, id) {
        if(db.DEBUG) {
            console.log(" - [db] Loading Message(id: " + id + ") from the database..."); 
        }

        var query0 = "SELECT * FROM messages WHERE id='" + id + "'";
        var result = await db.sqlConn.promise().query(query0);
        if(result.length < 1 || result[0].length < 1) {
            return undefined;
        }
    
        return this.formatMessage(result[0][0])
    },

    async fetchMessages(db, id) {
        if(db.DEBUG) {
            console.log(" - [db] Loading Messages from Channel(id: " + id + ") from the database..."); 
        }

        var query0 = "SELECT * FROM messages WHERE channelID='" + id + "' ORDER BY createdAT ASC";
        var result = await db.sqlConn.promise().query(query0);
        if(result.length < 1 || result[0].length < 1) {
            return [];
        }

        var res = result[0]
        res.forEach(_res => {
            _res = this.formatMessage(_res)
        });
    
        return res
    },

    async fetchFriendRequest(db, id) {
        if(db.DEBUG) {
            console.log(" - [db] Loading FriendRequest(id: " + id + ") from the database..."); 
        }

        var query0 = "SELECT * FROM friendrequests WHERE id='" + id + "'";
        var result = await db.sqlConn.promise().query(query0);
        if(result.length < 1 || result[0].length < 1) {
            return undefined;
        }
    
        return this.formatFriendRequest(result[0][0])
    },

    async fetchEmote(db, id) {
        if(db.DEBUG) {
            console.log(" - [db] Loading Emote(id: " + id + ") from the database..."); 
        }

        var query0 = "SELECT * FROM emotes WHERE id='" + id + "'";
        var result = await db.sqlConn.promise().query(query0);
        if(result.length < 1 || result[0].length < 1) {
            return undefined;
        }
    
        return this.formatEmote(result[0][0])
    },

    async fetchDefaultEmotes(db) {
        if(db.DEBUG) {
            console.log(" - [db] Loading DefaultEmotes from the database...");
        }

        var query0 = "SELECT * FROM emotes WHERE type=2";
        var result = await db.sqlConn.promise().query(query0);
        if(result.length < 1 || result[0].length < 1) {
            return [];
        }

        var res = result[0]
        res.forEach(_res => {
            _res = this.formatEmote(_res)
        });
    
        return res
    },

    async fetchFriendRequestByTarget(db, id) {
        if(db.DEBUG) {
            console.log(" - [db] Loading FriendRequest(target: " + id + ") from the database..."); 
        }

        var query0 = "SELECT * FROM friendrequests WHERE targetID='" + id + "'";
        var result = await db.sqlConn.promise().query(query0);
        if(result.length < 1 || result[0].length < 1) {
            return undefined;
        }
    
        return this.formatFriendRequest(result[0][0])
    },

    async fetchFriendRequests(db, id, type) {
        if(db.DEBUG) {
            console.log(" - [db] Loading FriendRequests from User(id: " + id + ") from the database..."); 
        }

        var query0 = type === 0 ? "SELECT * FROM friendrequests WHERE authorID='" + id + "'" : "SELECT * FROM friendrequests WHERE targetID='" + id + "'";
        var result = await db.sqlConn.promise().query(query0);
        if(result.length < 1 || result[0].length < 1) {
            return [];
        }

        var res = result[0]
        res.forEach(_res => {
            _res = this.formatFriendRequest(_res)
        });
    
        return res
    },

    async fetchInvite(db, id) {
        if(db.DEBUG) {
            console.log(" - [db] Loading Invite(target: " + id + ") from the database..."); 
        }

        var query0 = "SELECT * FROM invites WHERE id='" + id + "'";
        var result = await db.sqlConn.promise().query(query0);
        if(result.length < 1 || result[0].length < 1) {
            return undefined;
        }
    
        return this.formatInvite(result[0][0])
    },

    async fetchNote(db, id) {
        if(db.DEBUG) {
            console.log(" - [db] Loading Note(id: " + id + ") from the database..."); 
        }

        var query0 = "SELECT * FROM notes WHERE id='" + id + "'";
        var result = await db.sqlConn.promise().query(query0);
        if(result.length < 1 || result[0].length < 1) {
            return undefined;
        }
    
        return this.formatNote(result[0][0])
    },

    async fetchNoteByAuthorAndTarget(db, authorID, targetID) {
        if(db.DEBUG) {
            console.log(" - [db] Loading Note from Author(id: " + authorID + ") to Target(id: " + targetID + ") from the database..."); 
        }

        var query0 = "SELECT * FROM notes WHERE authorID='" + authorID + "' AND targetID='" + targetID + "'";
        var result = await db.sqlConn.promise().query(query0);
        if(result.length < 1 || result[0].length < 1) {
            return undefined;
        }
    
        return this.formatNote(result[0][0])
    },

    async fetchNotes(db, id) {
        if(db.DEBUG) {
            console.log(" - [db] Loading Notes from User(id: " + id + ") from the database..."); 
        }

        var query0 = "SELECT * FROM notes WHERE authorID='" + id + "'";
        var result = await db.sqlConn.promise().query(query0);
        if(result.length < 1 || result[0].length < 1) {
            return [];
        }

        var res = result[0]
        res.forEach(_res => {
            _res = this.formatNote(_res)
        });
    
        return res
    },

    formatServer(server) {
        server.channels = server.channels.split(",").filter(a => a.length > 0)
        server.members = server.members.split(",").filter(a => a.length > 0)
        server.invites = server.invites.split(",").filter(a => a.length > 0)
        server.emotes = server.emotes.split(",").filter(a => a.length > 0)
        server.author = { id: server.authorID }
        delete server.authorID
        
        return server;
    },

    formatUser(user, containSensitive, containPassword) {
        user.friends = user.friends.split(",").filter(a => a.length > 0)
        user.dmChannels = user.dmChannels.split(",").filter(a => a.length > 0)
        user.servers = user.servers.split(",").filter(a => a.length > 0)
        user.emotes = user.emotes.split(",").filter(a => a.length > 0)
        user.badges = user.badges.split(",").filter(a => a.length > 0)
        user.customStatus = user.customStatus == null ? undefined : user.customStatus

        user.connections = {}
        user.connections.github = user.gh_username == null ? undefined : { username: user.gh_username }
        delete user.gh_username
        delete user.gh_token
        user.connections.reddit = user.reddit_username == null ? undefined : { username: user.reddit_username }
        delete user.reddit_username
        delete user.reddit_token
        user.connections.osu = user.osu_username == null ? undefined : { username: user.osu_username }
        delete user.osu_username
        delete user.osu_token
        user.connections.twitch = user.twitch_username == null ? undefined : { username: user.twitch_username }
        delete user.twitch_username
        delete user.twitch_token

        if(containPassword !== true) {
            delete user.password
        }
        if(containSensitive !== true) {
            delete user.email
        }
        
        return user;
    },

    formatMessage(message) {
        message.author = { id: message.authorID }
        delete message.authorID
        message.channel = { id: message.channelID }
        delete message.channelID
        message.file = message.fileName == null ? undefined : { name: message.fileName, size: message.fileSize }
        delete message.fileName
        delete message.fileSize

        return message;
    },

    formatChannel(channel) {
        channel.author = { id: channel.authorID }
        delete channel.authorID
        channel.server = { id: channel.serverID }
        delete channel.serverID
        channel.members = channel.members == null ? undefined : channel.members.split(",").filter(a => a.length > 0)
        channel.description = channel.description == null ? undefined : channel.description

        return channel;
    },

    formatFriendRequest(friendRequest) {
        friendRequest.author = { id: friendRequest.authorID }
        delete friendRequest.authorID
        friendRequest.target = { id: friendRequest.targetID }
        delete friendRequest.targetID

        return friendRequest;
    },

    formatInvite(invite) {
        invite.author = { id: invite.authorID }
        delete invite.authorID
        invite.server = { id: invite.serverID }
        delete invite.serverID
        
        return invite;
    },

    formatEmote(emote) {
        emote.author = { id: emote.authorID }
        delete emote.authorID
        emote.server = emote.serverID == null ? undefined : { id: emote.serverID }
        delete emote.serverID
        
        return emote;
    },

    formatNote(note) {
        note.author = { id: note.authorID }
        delete note.authorID
        note.target = { id: note.targetID }
        delete note.targetID

        return note;
    }
}