class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/produceVoiceTransports', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }

            await this.produceVoiceTransports(req, res, req.body)
            console.log("> received voice transport produce - " + req.body.channel.id);
        }).bind(this));
    }

    async produceVoiceTransports(req, res, connection) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var channel = await this.app.db.db_fetch.fetchChannel(this.app.db, connection.channel.id);

        var transports = this.app.voiceGroupTransports[channel.id];
        var producer = transports.producer[user.id];
        var a = await producer.produce({ kind: connection.kind, rtpParameters : connection.rtpParameters });
        var b = { channel: { id: channel.id }, id: a.id };

        res.send(JSON.stringify(b));
        voiceGroup.users.forEach(id => {
            this.app.epFunc.emitToUser(id, "newProducer", b)
        });
    }
}

module.exports = Endpoint;