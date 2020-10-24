class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/consumeVoiceTransports', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }

            await this.consumeVoiceTransports(req, res, req.body)
            console.log("> received voice transport consume - " + req.body.channel.id);
        }).bind(this));
    }

    async consumeVoiceTransports(req, res, connection) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var channel = await this.app.db.db_fetch.fetchChannel(this.app.db, connection.channel.id);

        var transports = this.app.voiceGroupTransports.get(channel.id);
        var consumer = transports.consumer.get(user.id);
        var a = await consumer.consume({ producerId: connection.producerID, rtpCapabilities: connection.rtpCapabilities });
        var b = {
            producerID: connection.producerID,
            id: a.id,
            kind: a.kind,
            rtpParameters: a.rtpParameters,
            type: a.type,
            producerPaused: a.producerPaused
        }

        res.send(JSON.stringify(b));
    }
}

module.exports = Endpoint;