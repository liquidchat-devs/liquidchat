class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/register', (async(req, res) => {
            const data = req.body;
            var user = await this.app.db.db_fetch.fetchUserByUsername(this.app.db, data.username);

            if(user !== undefined) {
                res.send(JSON.stringify({ status: -1 }))
            } else if(data.password !== data.password2) {
                res.send(JSON.stringify({ status: -2 }))
            } else {
                const userID = this.app.crypto.randomBytes(16).toString("hex");
                const sessionID = this.app.crypto.randomBytes(16).toString("hex");
                const passwordHash = this.app.bcrypt.hashSync(data.password, this.app.config.salt)

                const session = {
                    id: sessionID,
                    userID: userID
                }

                const user = {
                    id: userID,
                    username: data.username,
                    createdAt: Date.now(),
                    avatar: "defaultAvatar.png",
                    password: passwordHash,
                    friends: [],
                    dmChannels: [],
                    servers: [],
                    status: 0
                }
        
                await this.app.db.db_add.addUser(this.app.db, user);

                this.app.sessions.set(sessionID, session);
                if(this.app.userSessions.has(user.id)) {
                    this.app.userSessions.get(user.id).push(sessionID);
                } else {
                    this.app.userSessions.set(user.id, [ sessionID ]);
                }

                res.cookie("sessionID", session.id, {
                    sameSite: "None", secure: true
                });
                res.send(JSON.stringify(session));
            }
        }).bind(this))
    }
}

module.exports = Endpoint;