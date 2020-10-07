class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/sendFriendRequest', (async(req, res) => {
            if(!this.app.isSessionValid(req, res)) { return; }

            await this.sendFriendRequest(req, res, req.body)
            console.log("> sent friend request - " + req.body.target.username + " (id: " + req.body.target.id + ")")
        }).bind(this));
    }

    async sendFriendRequest(req, res, _friendRequest) {
        var socket = this.app.sessionSockets.get(req.cookies['sessionID']);
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);

        var targetUser = -1;
        if(_friendRequest.target.id !== undefined) {
            targetUser = await this.app.db.db_fetch.fetchUser(this.app.db, _friendRequest.target.id);
        } else {
            targetUser = await this.app.db.db_fetch.fetchUserByUsername(this.app.db, _friendRequest.target.username);
        }

        if(targetUser === undefined) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        }

        var friendRequest = await this.app.db.db_fetch.fetchFriendRequestByTarget(this.app.db, targetUser.id);
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
            id: this.app.crypto.randomBytes(16).toString("hex"),
            author: {
                id: user.id
            },
            target: {
                id: targetUser.id
            },
            createdAt: Date.now()
        }
        
        await this.app.db.db_add.addFriendRequest(this.app.db, friendRequest);

        if(socket.connected) {
            var friendRequestsOut = await this.app.db.db_fetch.fetchFriendRequests(this.app.db, user.id, 0);
            var friendRequestsIn = await this.app.db.db_fetch.fetchFriendRequests(this.app.db, user.id, 1);
            var friendRequests = friendRequestsOut.concat(friendRequestsIn);

            socket.emit("updateFriendRequests", JSON.stringify(friendRequests))

            friendRequestsOut = await this.app.db.db_fetch.fetchFriendRequests(this.app.db, targetUser.id, 0);
            friendRequestsIn = await this.app.db.db_fetch.fetchFriendRequests(this.app.db, targetUser.id, 1);
            friendRequests = friendRequestsOut.concat(friendRequestsIn);

            this.app.epFunc.emitToUser(this.app, targetUser.id, "updateUser", targetUser);
            this.app.epFunc.emitToUser(this.app, targetUser.id, "updateFriendRequests", friendRequests);
        }
    }
}

module.exports = Endpoint;