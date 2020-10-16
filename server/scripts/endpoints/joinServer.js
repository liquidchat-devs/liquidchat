class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/joinServer', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }

            await this.joinServer(req, res, req.body)
            console.log("> added to server - " + req.body.id)
        }).bind(this));
    }

    async joinServer(req, res, _data) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var server = await this.app.db.db_fetch.fetchServer(this.app.db, _data.id);

        if(server === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else if(server.members.includes(user.id) === true) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        } else {
            res.sendStatus(200);
        }

        user.servers.push(server.id);
        this.app.epFunc.emitToUser(user.id, "createServer", server);
        this.app.epFunc.emitToUser(user.id, "updateUser", user);

        server.members.push(user.id);
        server.members.forEach(id => {
            this.app.epFunc.emitToUser(id, "updateServer", server)
        });

        if(server.channels.length > 0) { this.app.epFunc.sendSystemMessage({ channel: { id: server.channels[0] }, text: "<@" + user.id + "> joined the server!", type: 3 }) }
        await this.app.db.db_edit.editServer(this.app.db, server);
        await this.app.db.db_edit.editUser(this.app.db, user);
    }
}

module.exports = Endpoint;