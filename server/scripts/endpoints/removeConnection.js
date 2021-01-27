class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/removeConnection', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }

            var session = this.app.sessions.get(req.cookies['sessionID']);
            var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
            this.app.db.db_edit.removeUserConnection(this.app.db, user, req.body.type);

            var newUser = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
            this.app.epFunc.emitToUser(newUser.id, "updateUser", newUser);
        }).bind(this));
    }
}

module.exports = Endpoint;