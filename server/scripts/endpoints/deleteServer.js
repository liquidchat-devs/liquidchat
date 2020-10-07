module.exports = {
    handle(app) {
        app.post('/deleteServer', async(req, res) => {
            if(!app.isSessionValid(req, res)) { return; }

            await this.deleteServer(app, req, res, req.body)
            console.log("> deleted server - " + req.body.id)
        });
    },

    async deleteServer(app, req, res, _server) {
        var session = app.sessions.get(req.cookies['sessionID']);
        var user = await app.db.db_fetch.fetchUser(app.db, session.userID);
        var server = await app.db.db_fetch.fetchServer(app.db, _server.id);

        if(server === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else if(server.author.id !== user.id) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        } else {
            res.send(JSON.stringify({ status: 1 }))
        }

        app.sessionSockets.forEach(socket => {
            if(socket.connected) {
                socket.emit("deleteServer", JSON.stringify(server))
            }
        })

        await app.db.db_delete.deleteServer(app.db, server.id);
    }
}