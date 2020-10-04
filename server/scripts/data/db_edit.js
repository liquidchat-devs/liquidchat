module.exports = {
    editUser(db, user) {
        if(db.DEBUG) {
            console.log(" - [db] Editing User(id: " + user.id + ") in the database..."); 
        }

        var query0 = "username='" + user.username + "', avatar='" + user.avatar + "', friendList='" + user.friendList.join(",") + "', dmChannelList='" + user.dmChannelList.join(",") + "', status=" + user.status + (user.email == null ? "" : ", email='" + user.email + "'") + (user.password == null ? "" : ", password='" + user.password + "'")
        var query = "UPDATE users SET " + query0 + " WHERE id='" + user.id + "'";
        db.sqlConn.promise().query(query)
        .then((result, err) => {
            if(err) { throw err; }
        });
    },
    
    editMessage(db, message) {
        if(db.DEBUG) {
            console.log(" - [db] Editing Message(id: " + message.id + ") in the database..."); 
        }

        var query0 = "text='" + message.text + "', edited=" + message.edited + (message.file == null ? "" : ", fileName='" + message.file.name + "', fileSize=" + message.file.size)
        var query = "UPDATE messages SET " + query0 + " WHERE id='" + message.id + "'";
        db.sqlConn.promise().query(query)
        .then((result, err) => {
            if(err) { throw err; }
        });
    },
    
    editChannel(db, channel) {
        if(db.DEBUG) {
            console.log(" - [db] Editing Channel(id: " + channel.id + ") in the database..."); 
        }

        var query0 = "name='" + channel.name + "'" + (channel.members == null ? "" : ", '" + channel.members.join(",") + "')")
        var query = "UPDATE channels SET " + query0 + " WHERE id='" + channel.id + "'";
        db.sqlConn.promise().query(query)
        .then((result, err) => {
            if(err) { throw err; }
        });
    }
}