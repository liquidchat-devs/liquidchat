module.exports = {
    async processFriendRequest(app, req, res, _friendRequest, _accept) {
        var socket = app.sessionSockets.get(req.cookies['sessionID']);
        var session = app.sessions.get(req.cookies['sessionID']);
        var user = await app.db.db_fetch.fetchUser(app.db, session.userID);
        var friendRequest = await app.db.db_fetch.fetchFriendRequest(app.db, _friendRequest.id);

        if(friendRequest === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else if(friendRequest.target.id !== user.id && friendRequest.author.id !== user.id) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        }  else {
            res.send(JSON.stringify({ status: 1 }))
        }

        await app.db.db_delete.deleteFriendRequest(app.db, friendRequest.id);
        var authorUser = await app.db.db_fetch.fetchUser(app.db, friendRequest.author.id);
        var targetUser = await app.db.db_fetch.fetchUser(app.db, friendRequest.target.id);
        user = friendRequest.target.id === user.id ? targetUser : authorUser;

        if(_accept) {
            authorUser.friendList.push(targetUser.id);
            targetUser.friendList.push(authorUser.id);
        }

        await app.db.db_edit.editUser(app.db, authorUser);
        await app.db.db_edit.editUser(app.db, targetUser);

        if(socket.connected) {
            var friendRequestsOut = await app.db.db_fetch.fetchFriendRequests(app.db, user.id, 0);
            var friendRequestsIn = await app.db.db_fetch.fetchFriendRequests(app.db, user.id, 1);
            var friendRequests = friendRequestsOut.concat(friendRequestsIn);

            socket.emit("updateUser", JSON.stringify(user))
            socket.emit("updateFriendRequests", JSON.stringify(friendRequests))

            friendRequestsOut = await app.db.db_fetch.fetchFriendRequests(app.db, targetUser.id, 0);
            friendRequestsIn = await app.db.db_fetch.fetchFriendRequests(app.db, targetUser.id, 1);
            friendRequests = friendRequestsOut.concat(friendRequestsIn);

            app.epFunc.emitToUser(app, targetUser.id, "updateUser", targetUser);
            app.epFunc.emitToUser(app, targetUser.id, "updateFriendRequests", friendRequests);
        }
    },

    async editUser(app, req, res, _user) {
        var socket = app.sessionSockets.get(req.cookies['sessionID']);
        var session = app.sessions.get(req.cookies['sessionID']);
        var user = await app.db.db_fetch.fetchUser(app.db, session.userID);
        res.send(JSON.stringify({ status: 1 }))

        user.email = _user.email;
        await app.db.db_edit.editUser(app.db, user);

        if(socket.connected) {
            socket.emit("updateUser", JSON.stringify(user))
        }
    },

    async updateUser(app, user, broadcast) {
        app.sessionSockets.forEach(socket => {
            if(broadcast && socket.connected) {
                socket.emit("updateUser", JSON.stringify(user))
            }
        })

        await app.db.db_edit.editUser(app.db, user);
    },

    async updateServer(app, server, broadcast) {
        app.sessionSockets.forEach(socket => {
            if(broadcast && socket.connected) {
                socket.emit("updateServer", JSON.stringify(server))
            }
        })

        await app.db.db_edit.editServer(app.db, server);
    },

    async emitToUser(app, id, type, data) {
        if(app.userSessions.has(id)) {
            app.userSessions.get(id).forEach(sessionID => {
                if(app.sessionSockets.has(sessionID)) {
                    app.sessionSockets.get(sessionID).emit(type, JSON.stringify(data));
                }
            })
        }
    }
}