module.exports = {
    deleteServer(db, id) {
        if(db.DEBUG) {
            console.log(" - [db] Deleting Server(id: " + id + ") from the database..."); 
        }

        var query = "DELETE FROM servers WHERE id='" + id + "'";
        db.sqlConn.promise().query(query)
        .then((result, err) => {
            if(err) { throw err; }
        });
    },

    deleteUser(db, id) {
        if(db.DEBUG) {
            console.log(" - [db] Deleting User(id: " + id + ") from the database..."); 
        }

        var query = "DELETE FROM users WHERE id='" + id + "'";
        db.sqlConn.promise().query(query)
        .then((result, err) => {
            if(err) { throw err; }
        });
    },
    
    deleteChannel(db, id) {
        if(db.DEBUG) {
            console.log(" - [db] Deleting Channel(id: " + id + ") from the database..."); 
        }

        var query = "DELETE FROM channels WHERE id='" + id + "'";
        db.sqlConn.promise().query(query)
        .then((result, err) => {
            if(err) { throw err; }
        });
    },
    
    deleteMessage(db, id) {
        if(db.DEBUG) {
            console.log(" - [db] Deleting Message(id: " + id + ") from the database..."); 
        }

        var query = "DELETE FROM messages WHERE id='" + id + "'";
        db.sqlConn.promise().query(query)
        .then((result, err) => {
            if(err) { throw err; }
        });
    },

    deleteFriendRequest(db, id) {
        if(db.DEBUG) {
            console.log(" - [db] Deleting FriendRequest(id: " + id + ") from the database..."); 
        }

        var query = "DELETE FROM friendRequests WHERE id='" + id + "'";
        db.sqlConn.promise().query(query)
        .then((result, err) => {
            if(err) { throw err; }
        });
    },
    
    deleteAllData(db) {
        if(db.DEBUG) {
            console.log(" - [db] Deleting all data from the database..."); 
        }

        var query = "DELETE FROM users";
        db.sqlConn.promise().query(query)
        .then((result, err) => {
            if(err) { throw err; }
        });
        query = "DELETE FROM channels";
        db.sqlConn.promise().query(query)
        .then((result, err) => {
            if(err) { throw err; }
        });
        query = "DELETE FROM messages";
        db.sqlConn.promise().query(query)
        .then((result, err) => {
            if(err) { throw err; }
        });
        query = "DELETE FROM friendRequests";
        db.sqlConn.promise().query(query)
        .then((result, err) => {
            if(err) { throw err; }
        });
    }
}