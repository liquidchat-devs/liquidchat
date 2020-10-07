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
            res.send(JSON.stringify({ status: 1 }))
        }

        await this.app.db.db_delete.deleteFriendRequest(this.app.db, friendRequest.id);
        var authorUser = await this.app.db.db_fetch.fetchUser(this.app.db, friendRequest.author.id);
        var targetUser = await this.app.db.db_fetch.fetchUser(this.app.db, friendRequest.target.id);
        user = friendRequest.target.id === user.id ? targetUser : authorUser;

        if(_accept) {
            authorUser.friendList.push(targetUser.id);
            targetUser.friendList.push(authorUser.id);
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

            this.app.epFunc.emitToUser(this.app, targetUser.id, "updateUser", targetUser);
            this.app.epFunc.emitToUser(this.app, targetUser.id, "updateFriendRequests", friendRequests);
        }
    }

    async editUser(req, res, _user) {
        var socket = this.app.sessionSockets.get(req.cookies['sessionID']);
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        res.send(JSON.stringify({ status: 1 }))

        user.email = _user.email;
        await this.app.db.db_edit.editUser(this.app.db, user);

        if(socket.connected) {
            socket.emit("updateUser", JSON.stringify(user))
        }
    }

    async updateUser(user, broadcast) {
        this.app.sessionSockets.forEach(socket => {
            if(broadcast && socket.connected) {
                socket.emit("updateUser", JSON.stringify(user))
            }
        })

        await this.app.db.db_edit.editUser(this.app.db, user);
    }

    async updateServer(server, broadcast) {
        this.app.sessionSockets.forEach(socket => {
            if(broadcast && socket.connected) {
                socket.emit("updateServer", JSON.stringify(server))
            }
        })

        await this.app.db.db_edit.editServer(this.app.db, server);
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
}