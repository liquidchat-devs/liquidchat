class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/sendIceCandidate', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }

            await this.sendIceCandidate(req, res, req.body)
            console.log("> received voice disconnection - " + req.body.channel.id)
        }).bind(this));
    }

    async sendIceCandidate(req, res, connection) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var channel = await this.app.db.db_fetch.fetchChannel(this.app.db, connection.channel.id);

        if(channel === undefined) {
            res.send(JSON.stringify({ status: -1 }))
            return;
        }

        var voiceGroup = -1;
        if(this.app.voiceGroups.has(channel.id) === false) {
            res.send(JSON.stringify({ status: -2 }))
            return;
        } else {
            voiceGroup = this.app.voiceGroups.get(channel.id)
            if(voiceGroup.users.includes(user.id) === false) {
                res.send(JSON.stringify({ status: -3 }))
                return;
            }

            voiceGroup.users.forEach(id => {
                this.app.epFunc.emitToUser(id, "receiveIceCandidate", connection.candidate)
            });
        }

        res.sendStatus(200);
    }
}

module.exports = Endpoint;