class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.get('/fetchInvite', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }
            const data = req.query;
            var invite = await this.app.db.db_fetch.fetchInvite(this.app.db, data.id);

            if(invite === undefined) {
                res.send(JSON.stringify({ status: -1 }))
            } else {
                res.send(JSON.stringify(invite))
            }
        }).bind(this));
    }
}

module.exports = Endpoint;