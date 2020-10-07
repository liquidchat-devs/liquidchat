class Endpoint {
    constructor(app) {
        this.app = this.app;
    }

    handle() {
        this.app.post('/deleteServer', async(req, res) => {
            if(!this.app.isSessionValid(req, res)) { return; }

            await this.deleteServer(req, res, req.body)
            console.log("> deleted server - " + req.body.id)
        });
    }

    async deleteServer(req, res, _server) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var server = await this.app.db.db_fetch.fetchServer(this.app.db, _server.id);

        if(server === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else if(server.author.id !== user.id) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        } else {
            res.send(JSON.stringify({ status: 1 }))
        }

        this.app.sessionSockets.forEach(socket => {
            if(socket.connected) {
                socket.emit("deleteServer", JSON.stringify(server))
            }
        })

        await this.app.db.db_delete.deleteServer(this.app.db, server.id);
    }
}

module.exports = Endpoint;