
var util   = require('util');
var yeoman = require('yeoman');
var path = require('path');
var mysql = require('mysql');
var conn;


module.exports = Generator;

function Generator() {
    yeoman.generators.NamedBase.apply(this, arguments);
    // this is the default. Uncomment and change the path if you want
    // to change the source root directory for this generator.
    //
    // this.sourceRoot(path.join(__dirname, 'templates'));
}

util.inherits(Generator, yeoman.generators.NamedBase);


Generator.prototype.createParisFiles = function createParisFiles() {
    var cb = this.async();
    var self = this;
    conn = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'root123',
        database : 'avias'
    });
    conn.connect();
    conn.query('SHOW TABLES;', function(err, rows, fields) {
        if (err) throw err;
        self.tables = {};
        for(var i =0; i<rows.length; i++) {
            var name = rows[i][fields[0].name];
            self.tables[name] = {has_many:[]};
            self.table = name;
            self.template("rest.php", path.join('src/controllers', name+'.php'));
        }
        for(var i =0; i<rows.length; i++) {
            var name = rows[i][fields[0].name];
            self.log.ok(name);
            self.table = name;
            conn.query('SHOW COLUMNS from ' + name, (function(n){
                return function(err, rows, fields) {
                    if (err) throw err;
                    self.log.ok(n);
                    self.fields = [];

                    self.many_rels = [];
                    self.belongs = [];
                    for(var i =0; i<rows.length; i++) {
                        var fname = rows[i][fields[0].name];
                        if (fname.match(/^(.+?)_id$/)) {
                            self.belongs.push(RegExp.$1);
                            self.tables[RegExp.$1].has_many.push(n);
                        }
                        self.fields.push(fname);
                    }
                    self.tables[n].fields = self.fields;
                    self.tables[n].belongs = self.belongs;
                    self.table = n;
                    cb();

                };
            })(name));

        }
        self.log(JSON.stringify(self.tables));
        conn.end();
        //cb();

        setTimeout(function(){
            self.template("model.php", path.join('app/models','model.php'));
            cb();
        },1000)
    });

};
