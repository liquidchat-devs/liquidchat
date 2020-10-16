class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/kickFromServer', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }

            await this.kickFromServer(req, res, req.body)
            console.log("> kicked from server - " + req.body.server.id + "/" + req.body.user.id)
        }).bind(this));
    }

    async kickFromServer(req, res, _data) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var server = await this.app.db.db_fetch.fetchServer(this.app.db, _data.server.id);
        var targetUser = await this.app.db.db_fetch.fetchUser(this.app.db, _data.user.id);

        if(server === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        } else if(targetUser === undefined) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        } else if(server.author.id !== user.id) {
            res.send(JSON.stringify({ status: -3 }))
            return;
        } else if(server.members.includes(user.id) === false) {
            res.send(JSON.stringify({ status: -4 }))
            return;
        } else {
            res.sendStatus(200);
        }

        server.members.splice(server.members.indexOf(targetUser.id), 1);
        server.members.forEach(id => {
            this.app.epFunc.emitToUser(id, "updateServer", server)
        });

        targetUser.servers.splice(targetUser.servers.indexOf(server.id), 1);
        this.app.epFunc.emitToUser(targetUser.id, "deleteServer", server);

        await this.app.db.db_edit.editServer(this.app.db, server);
        await this.app.db.db_edit.editUser(this.app.db, targetUser);
        if(server.channels.length > 0) { this.app.epFunc.sendSystemMessage({ channel: { id: server.channels[0] }, text: "<@" + user.id + "> left the server!", type: 4 }) }
    }
}

module.exports = Endpoint;