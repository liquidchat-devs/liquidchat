class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/leaveServer', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }

            await this.leaveServer(req, res, req.body)
            console.log("> removed from server - " + req.body.id)
        }).bind(this));
    }

    async leaveServer(req, res, _data) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var server = await this.app.db.db_fetch.fetchServer(this.app.db, _data.id);

        if(server === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else if(server.members.includes(user.id) === false) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        } else {
            res.send(JSON.stringify({ status: 1 }))
        }

        server.members.splice(server.members.indexOf(user.id), 1);
        server.members.forEach(id => {
            this.app.epFunc.emitToUser(id, "updateServer", server)
        });

        user.servers.splice(user.servers.indexOf(user.id), 1);
        this.app.epFunc.emitToUser(user.id, "deleteServer", server);

        await this.app.db.db_edit.editServer(this.app.db, server);
        await this.app.db.db_edit.editUser(this.app.db, user);
    }
}

module.exports = Endpoint;