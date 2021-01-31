class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.get('/fetchNotes', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }
            const data = req.query;
            var session = this.app.sessions.get(req.cookies['sessionID']);
            var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);

            var notes = await this.app.db.db_fetch.fetchNotes(this.app.db, user.id);
            res.send(JSON.stringify(notes));
        }).bind(this));
    }
}

module.exports = Endpoint;