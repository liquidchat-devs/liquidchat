module.exports = {
    handle(app) {
        app.post('/sendFriendRequest', async(req, res) => {
            if(!app.isSessionValid(req, res)) { return; }

            await this.sendFriendRequest(app, req, res, req.body)
            console.log("> sent friend request - " + req.body.target.username + " (id: " + req.body.target.id + ")")
        });
    },

    async sendFriendRequest(app, req, res, _friendRequest) {
        var socket = app.sessionSockets.get(req.cookies['sessionID']);
        var session = app.sessions.get(req.cookies['sessionID']);
        var user = await app.db.db_fetch.fetchUser(app.db, session.userID);

        var targetUser = -1;
        if(_friendRequest.target.id !== undefined) {
            targetUser = await app.db.db_fetch.fetchUser(app.db, _friendRequest.target.id);
        } else {
            targetUser = await app.db.db_fetch.fetchUserByUsername(app.db, _friendRequest.target.username);
        }

        if(targetUser === undefined) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        }

        var friendRequest = await app.db.db_fetch.fetchFriendRequestByTarget(app.db, targetUser.id);
        if(friendRequest !== undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else if(user.id === targetUser.id) {
            res.send(JSON.stringify({ status: -3 }))
            return;
        } else {
            res.send(JSON.stringify({ status: 1 }))
        }

        var friendRequest = {
            id: app.crypto.randomBytes(16).toString("hex"),
            author: {
                id: user.id
            },
            target: {
                id: targetUser.id
            },
            createdAt: Date.now()
        }
        
        await app.db.db_add.addFriendRequest(app.db, friendRequest);

        if(socket.connected) {
            var friendRequestsOut = await app.db.db_fetch.fetchFriendRequests(app.db, user.id, 0);
            var friendRequestsIn = await app.db.db_fetch.fetchFriendRequests(app.db, user.id, 1);
            var friendRequests = friendRequestsOut.concat(friendRequestsIn);

            socket.emit("updateFriendRequests", JSON.stringify(friendRequests))

            friendRequestsOut = await app.db.db_fetch.fetchFriendRequests(app.db, targetUser.id, 0);
            friendRequestsIn = await app.db.db_fetch.fetchFriendRequests(app.db, targetUser.id, 1);
            friendRequests = friendRequestsOut.concat(friendRequestsIn);

            app.epFunc.emitToUser(app, targetUser.id, "updateUser", targetUser);
            app.epFunc.emitToUser(app, targetUser.id, "updateFriendRequests", friendRequests);
        }
    }
}