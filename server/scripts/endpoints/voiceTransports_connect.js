class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/connectVoiceTransports', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }

            await this.connectVoiceTransports(req, res, req.body)
            console.log("> received voice transport connection - " + req.body.channel.id);
        }).bind(this));
    }

    async connectVoiceTransports(req, res, connection) {
        var session = this.app.sessions.get(req.cookies['sessionID']);
        var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
        var channel = await this.app.db.db_fetch.fetchChannel(this.app.db, connection.channel.id);

        var transports = this.app.voiceGroupTransports.get(channel.id);
        var consumer = transports.consumer.get(user.id);
        var producer = transports.producer.get(user.id);
        consumer.connect({ dtlsParameters: connection.consumerDTLS });
        producer.connect({ dtlsParameters: connection.producerDTLS });

        res.sendStatus(200);
    }
}

module.exports = Endpoint;