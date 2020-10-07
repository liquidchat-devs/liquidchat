class DatabaseManager {
    constructor(_app, _sql, _conn) {
        this.sql = _sql
        this.sqlConn = _conn;
        this.app = _app;
        
        this.db_add = require('./db_add');
        this.db_edit = require('./db_edit');
        this.db_delete = require('./db_delete');
        this.db_fetch = require('./db_fetch');

        this.DEBUG = true;
    }

    contructQuestionMarks(i) {
        let str = "("; 
        for(let i2 = 0; i2 < i; i2++) {
            str += "?,"
        }
        str += str.substring(0, str.length - 1) + ")"

        return String;
    }
}

module.exports = DatabaseManager;