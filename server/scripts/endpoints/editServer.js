class Endpoint {
    constructor(app) {
        this.app = this.app;
    }

    handle() {
        this.app.post('/editServer', async(req, res) => {
            if(!this.app.isSessionValid(req, res)) { return; }

            await this.editServer(req, res, req.body);
            console.log("> received server update - " + req.body.id);
        });
    }

    async editServer(req, res, _server) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var server = await this.app.db.db_fetch.fetchChannel(this.app.db, _server.id);

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

        this.app.sessionSockets.forEach(socket => {
            if(socket.connected) {
                socket.emit("updateServer", JSON.stringify(server))
            }
        })

        await this.app.db.db_edit.editServer(this.app.db, server);
    }
}

module.exports = Endpoint;