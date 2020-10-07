module.exports = {
    handle(app) {
        app.get('/fetchFriendRequests', async(req, res) => {
            if(!app.isSessionValid(req, res)) { return; }
            var session = app.sessions.get(req.cookies['sessionID']);
            var user = await app.db.db_fetch.fetchUser(app.db, session.userID);

            var friendRequestsOut = await app.db.db_fetch.fetchFriendRequests(app.db, user.id, 0);
            var friendRequestsIn = await app.db.db_fetch.fetchFriendRequests(app.db, user.id, 1);
            var friendRequests = friendRequestsOut.concat(friendRequestsIn);
            res.send(JSON.stringify(friendRequests));
        });
    }
}