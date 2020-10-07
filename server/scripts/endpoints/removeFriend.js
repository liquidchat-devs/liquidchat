module.exports = {
    handle(app) {
        app.post('/removeFriend', async(req, res) => {
            if(!app.isSessionValid(req, res)) { return; }

            await this.removeFriend(app, req, res, req.body)
            console.log("> removed friend - " + req.body.target.id)
        });
    },

    async removeFriend(app, req, res, _removalRequest) {
        var socket = app.sessionSockets.get(req.cookies['sessionID']);
        var session = app.sessions.get(req.cookies['sessionID']);
        var user = await app.db.db_fetch.fetchUser(app.db, session.userID);

        if(user.friendList.includes(_removalRequest.target.id) === false) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else {
            res.send(JSON.stringify({ status: 1 }))
        }

        var targetUser = await app.db.db_fetch.fetchUser(app.db, _removalRequest.target.id);
        user.friendList.splice(user.friendList.indexOf(targetUser.id), 1);
        targetUser.friendList.splice(targetUser.friendList.indexOf(user.id), 1);

        await app.db.db_edit.editUser(app.db, user);
        await app.db.db_edit.editUser(app.db, targetUser);

        if(socket.connected) {
            socket.emit("updateUser", JSON.stringify(user))
            app.epFunc.emitToUser(app, targetUser.id, "updateUser", targetUser);
        }
    }
}