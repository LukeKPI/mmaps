
var util   = require('util');
var yeoman = require('yeoman');
var path = require('path');
var mysql = require('mysql');
var conn;
var init = 0;


module.exports = Generator;

function Generator() {
    yeoman.generators.NamedBase.apply(this, arguments);
    // this is the default. Uncomment and change the path if you want
    // to change the source root directory for this generator.
    //
    // this.sourceRoot(path.join(__dirname, 'templates'));
    var self = this;
    if (init == 0 ) {
        init++;
        return;
    }
    conn = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'root123',
        database : 'avias'
    });
    conn.connect();
    self.tables_read = 0;
    conn.query('SHOW TABLES;', function(err, rows, fields) {
        if (err) throw err;
        self.tables = {};
        self.tables_count = rows.length;
        for(var i =0; i<rows.length; i++) {
            var name = rows[i][fields[0].name];
            self.tables[name] = {has_many:[]};
            self.table = name;
        }
        for(var i =0; i<rows.length; i++) {
            var name = rows[i][fields[0].name];
            self.log.ok(name);
            self.table = name;
            conn.query('SHOW COLUMNS from ' + name, (function(n){
                return function(err, rows, fields) {
                    if (err) throw err;
                    //self.log.ok(n);
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
                    self.tables_read++;
                    self.table = n;

                };
            })(name));

        }
        self.log(JSON.stringify(self.tables));
    });
}

util.inherits(Generator, yeoman.generators.NamedBase);


Generator.prototype.createBackendFiles = function createParisFiles() {
    //conn.end();
    var cb = this.async();
        //cb();
    var self = this;
    function runGenerators(){
        if (self.tables_read && self.tables_read == self.tables_count)  {
            for(var i in self.tables) {
                var name = i;
                self.table = name;
                self.template("rest.php", path.join('src/controllers2', name+'.php'));
            }
            self.template("model.php", path.join('app/models2','model.php'));
            cb();
        } else {
            self.log.ok("waiting...");
            setTimeout(runGenerators,100);
        }
    }

    setTimeout(runGenerators,100);

};