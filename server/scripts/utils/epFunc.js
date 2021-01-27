class Endpoint {
    constructor(app) {
        this.app = app;
    }

    async processFriendRequest(req, res, _friendRequest, _accept) {
        var socket = this.app.sessionSockets.get(req.cookies['sessionID']);
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var friendRequest = await this.app.db.db_fetch.fetchFriendRequest(this.app.db, _friendRequest.id);

        if(friendRequest === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else if(friendRequest.target.id !== user.id && friendRequest.author.id !== user.id) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        }  else {
            res.sendStatus(200);
        }

        await this.app.db.db_delete.deleteFriendRequest(this.app.db, friendRequest.id);
        var authorUser = await this.app.db.db_fetch.fetchUser(this.app.db, friendRequest.author.id);
        var targetUser = await this.app.db.db_fetch.fetchUser(this.app.db, friendRequest.target.id);
        user = friendRequest.target.id === user.id ? targetUser : authorUser;

        if(_accept) {
            authorUser.friends.push(targetUser.id);
            targetUser.friends.push(authorUser.id);
        }

        await this.app.db.db_edit.editUser(this.app.db, authorUser);
        await this.app.db.db_edit.editUser(this.app.db, targetUser);

        if(socket.connected) {
            var friendRequestsOut = await this.app.db.db_fetch.fetchFriendRequests(this.app.db, user.id, 0);
            var friendRequestsIn = await this.app.db.db_fetch.fetchFriendRequests(this.app.db, user.id, 1);
            var friendRequests = friendRequestsOut.concat(friendRequestsIn);

            socket.emit("updateUser", JSON.stringify(user))
            socket.emit("updateFriendRequests", JSON.stringify(friendRequests))

            friendRequestsOut = await this.app.db.db_fetch.fetchFriendRequests(this.app.db, targetUser.id, 0);
            friendRequestsIn = await this.app.db.db_fetch.fetchFriendRequests(this.app.db, targetUser.id, 1);
            friendRequests = friendRequestsOut.concat(friendRequestsIn);

            this.app.epFunc.emitToUser(targetUser.id, "updateUser", targetUser);
            this.app.epFunc.emitToUser(targetUser.id, "updateFriendRequests", friendRequests);
        }
    }

    async editUser(req, res, _user) {
        var socket = this.app.sessionSockets.get(req.cookies['sessionID']);
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);

        let availableStatuses = [0, 1, 2, 3]
        if(_user.status !== undefined && availableStatuses.includes(_user.status) === false) {
            res.send(JSON.stringify({ error: -1 }))
            return;
        }

        user.gh_username = _user.gh_username !== undefined ? _user.gh_username : user.gh_username;
        user.gh_token = _user.gh_token !== undefined ? _user.gh_token : user.gh_token;
        user.reddit_username = _user.reddit_username !== undefined ? _user.reddit_username : user.reddit_username;
        user.reddit_token = _user.reddit_token !== undefined ? _user.reddit_token : user.reddit_token;
        user.osu_username = _user.osu_username !== undefined ? _user.osu_username : user.osu_username;
        user.osu_token = _user.osu_token !== undefined ? _user.osu_token : user.osu_token;
        user.twitch_username = _user.twitch_username !== undefined ? _user.twitch_username : user.twitch_username;
        user.twitch_token = _user.twitch_token !== undefined ? _user.twitch_token : user.twitch_token;
        user.blizzard_username = _user.blizzard_username !== undefined ? _user.blizzard_username : user.blizzard_username;
        user.blizzard_token = _user.blizzard_token !== undefined ? _user.blizzard_token : user.blizzard_token;
        user.spotify_username = _user.spotify_username !== undefined ? _user.spotify_username : user.spotify_username;
        user.spotify_token = _user.spotify_token !== undefined ? _user.spotify_token : user.spotify_token;
        user.discord_username = _user.discord_username !== undefined ? _user.discord_username : user.discord_username;
        user.discord_token = _user.discord_token !== undefined ? _user.discord_token : user.discord_token;
       
        user.email = _user.email !== undefined ? _user.email : user.email;
        user.status = _user.status !== undefined ? _user.status : user.status;
        user.customStatus = _user.customStatus !== undefined ? _user.customStatus : user.customStatus;
        this.updateUser(user, true);

        res.send(JSON.stringify(user));
    }

    async editNote(req, res, _note) {
        var socket = this.app.sessionSockets.get(req.cookies['sessionID']);
        
        var note = await this.app.db.db_fetch.fetchNoteByAuthorAndTarget(this.app.db, _note.author.id, _note.target.id);
        if(note === undefined) {
            var noteData = {
                id: this.app.crypto.randomBytes(16).toString("hex"),
                author: { id: _note.author.id },
                target: { id: _note.target.id },
                createdAt: Date.now(),
                text: _note.text
            }

            await this.app.db.db_add.addNote(this.app.db, noteData);
            note = await this.app.db.db_fetch.fetchNote(this.app.db, noteData.id);
        }

        note.text = _note.text !== undefined ? _note.text : note.text;
        await this.app.db.db_edit.editNote(this.app.db, note);
        socket.emit("editNote", JSON.stringify(note))

        res.send(JSON.stringify(note));
    }

    async updateUser(user, broadcast) {
        await this.app.db.db_edit.editUser(this.app.db, user);

        if(user.customStatus === undefined || user.customStatus.length < 1) { user.customStatus = undefined; }
        this.app.sessionSockets.forEach(socket => {
            if(broadcast && socket.connected) {
                socket.emit("updateUser", JSON.stringify(user))
            }
        })
    }

    async updateServer(server, broadcast) {
        await this.app.db.db_edit.editServer(this.app.db, server);

        this.app.sessionSockets.forEach(socket => {
            if(broadcast && socket.connected) {
                socket.emit("updateServer", JSON.stringify(server))
            }
        })
    }

    async emitToUser(id, type, data) {
        if(this.app.userSessions.has(id)) {
            this.app.userSessions.get(id).forEach(sessionID => {
                if(this.app.sessionSockets.has(sessionID)) {
                    this.app.sessionSockets.get(sessionID).emit(type, JSON.stringify(data));
                }
            })
        }
    }

    async sendWebsocketMessage(sessionID, _message, callback) {
        var newReq = { cookies: { "sessionID": sessionID } }
        var newRes = {}
        newRes.send = (string) => {
            callback(string);
        };

        this.sendMessage(newReq, newRes, _message);
    }

    async sendMessage(req, res, _message) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var channel = await this.app.db.db_fetch.fetchChannel(this.app.db, _message.channel.id);
        if(channel === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        }

        var message = {
            id: this.app.crypto.randomBytes(16).toString("hex"),
            createdAt: Date.now(),
            author: {
                id: user.id
            },
            channel: {
                id: channel.id
            },
            edited: false,
            type: 0,
            text: _message.text
        }
        message.file = _message.file === undefined ? undefined : { name: _message.file.name, size: _message.file.size }

        switch(channel.type) {
            case 0:
            case 1:
                var server = await this.app.db.db_fetch.fetchServer(this.app.db, channel.server.id);
                server.members.forEach(id => {
                    this.app.epFunc.emitToUser(id, "message", message)
                });
                break;

            case 2:
                channel.members.forEach(async(id) => {
                    this.app.epFunc.emitToUser(id, "message", message)
                });
                break;
        }

        await this.app.db.db_add.addMessage(this.app.db, message);
        res.send(JSON.stringify(message))
    }

    async sendSystemMessage(_message) {
        var channel = await this.app.db.db_fetch.fetchChannel(this.app.db, _message.channel.id);
        if(channel === undefined) {
            return;
        }

        var message = {
            id: this.app.crypto.randomBytes(16).toString("hex"),
            createdAt: Date.now(),
            channel: {
                id: channel.id
            },
            edited: false,
            type: _message.type,
            text: _message.text
        }
        message.file = _message.file === undefined ? undefined : { name: _message.file.name, size: _message.file.size }

        switch(channel.type) {
            case 0:
            case 1:
                var server = await this.app.db.db_fetch.fetchServer(this.app.db, channel.server.id);
                server.members.forEach(id => {
                    this.app.epFunc.emitToUser(id, "message", message)
                });
                break;

            case 2:
                channel.members.forEach(async(id) => {
                    this.app.epFunc.emitToUser(id, "message", message)
                });
                break;
        }

        await this.app.db.db_add.addMessage(this.app.db, message);
    }
}

module.exports = Endpoint;