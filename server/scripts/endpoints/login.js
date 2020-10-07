module.exports = {
    handle(app) {
        app.post('/login', async(req, res) => {
            const data = req.body;
            switch(data.authType) {
                case "autologin":
                    if(!app.sessions.has(req.cookies["sessionID"])) {
                        res.send(JSON.stringify({ status: -3 }))
                    } else {
                        res.send(JSON.stringify(app.sessions.get(req.cookies["sessionID"])));
                    }
                    break;
        
                case "default":
                    var user = await app.db.db_fetch.fetchUserByUsername(app.db, data.username, true, true);
                    
                    if(user === undefined) {
                        res.send(JSON.stringify({ status: -2 }))
                    } else if(app.bcrypt.compareSync(data.password, user.password.toString()) == false) {
                        res.send(JSON.stringify({ status: -1 }))
                    } else {
                        const sessionID = app.crypto.randomBytes(16).toString("hex");
                        const session = {
                            id: sessionID,
                            userID: user.id,
                            status: 1
                        }
                
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
                    break;
            }
        })
    }
}