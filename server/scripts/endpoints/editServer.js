module.exports = {
    handle(app) {
        app.post('/editServer', async(req, res) => {
            if(!app.isSessionValid(req, res)) { return; }

            await this.editServer(app, req, res, req.body);
            console.log("> received server update - " + req.body.id);
        });
    },

    async editServer(app, req, res, _server) {
        var session = app.sessions.get(req.cookies['sessionID']);
        var user = await app.db.db_fetch.fetchUser(app.db, session.userID);
        var server = await app.db.db_fetch.fetchChannel(app.db, _server.id);

        if(server === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else if(server.author.id !== user.id) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        } else if(_server.name !== undefined && _server.name.length < 1) {
            res.send(JSON.stringify({ status: -3 }))
            return;
        } else {
            res.send(JSON.stringify({ status: 1 }))
        }

        //Make sure client doesn't overwrite something he's not allowed to
        server.name = _server.name !== undefined ? _server.name : server.name;

        app.sessionSockets.forEach(socket => {
            if(socket.connected) {
                socket.emit("updateServer", JSON.stringify(server))
            }
        })

        await app.db.db_edit.editServer(app.db, server);
    }
}