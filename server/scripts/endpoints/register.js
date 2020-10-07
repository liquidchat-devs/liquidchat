module.exports = {
    handle(app) {
        app.post('/register', async(req, res) => {
            const data = req.body;
            var user = await app.db.db_fetch.fetchUserByUsername(app.db, data.username);

            if(user !== undefined) {
                res.send(JSON.stringify({ status: -1 }))
            } else if(data.password !== data.password2) {
                res.send(JSON.stringify({ status: -2 }))
            } else {
                const userID = app.crypto.randomBytes(16).toString("hex");
                const sessionID = app.crypto.randomBytes(16).toString("hex");
                const passwordHash = app.bcrypt.hashSync(data.password, app.config.salt)

                const session = {
                    id: sessionID,
                    userID: userID,
                    status: 1
                }

                const user = {
                    id: userID,
                    username: data.username,
                    createdAt: Date.now(),
                    avatar: "defaultAvatar.png",
                    password: passwordHash,
                    friendList: [],
                    dmChannelList: [],
                    serverList: [],
                    status: 0
                }
        
                await app.db.db_add.addUser(app.db, user);

                app.sessions.set(sessionID, session);
                if(app.userSessions.has(user.id)) {
                    app.userSessions.get(user.id).push(sessionID);
                } else {
                    app.userSessions.set(user.id, [ sessionID ]);
                }

                res.cookie("sessionID", session.id, {
                    sameSite: "None"
                });
                res.send(JSON.stringify(session));
            }
        })
    }
}