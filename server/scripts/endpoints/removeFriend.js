class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/removeFriend', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }

            await this.removeFriend(req, res, req.body)
            console.log("> removed friend - " + req.body.target.id)
        }).bind(this));
    }

    async removeFriend(req, res, _removalRequest) {
        var socket = this.app.sessionSockets.get(req.cookies['sessionID']);
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);

        if(user.friendList.includes(_removalRequest.target.id) === false) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else {
            res.send(JSON.stringify({ status: 1 }))
        }

        var targetUser = await this.app.db.db_fetch.fetchUser(this.app.db, _removalRequest.target.id);
        user.friendList.splice(user.friendList.indexOf(targetUser.id), 1);
        targetUser.friendList.splice(targetUser.friendList.indexOf(user.id), 1);

        await this.app.db.db_edit.editUser(this.app.db, user);
        await this.app.db.db_edit.editUser(this.app.db, targetUser);

        if(socket.connected) {
            socket.emit("updateUser", JSON.stringify(user))
            this.app.epFunc.emitToUser(targetUser.id, "updateUser", targetUser);
        }
    }
}

module.exports = Endpoint;