var util   = require('util');
var path   = require('path');
var yeoman = require('yeoman');

module.exports = Generator;

function Generator() {
  yeoman.generators.NamedBase.apply(this, arguments);
//console.log(arguments);
  // this is the default. Uncomment and change the path if you want
  // to change the source root directory for this generator.
  //
  // this.sourceRoot(path.join(__dirname, 'templates'));

}

util.inherits(Generator, yeoman.generators.NamedBase);

Generator.prototype.createSomething = function() {
  this.log.writeln("I\m doing something");
  this.log.writeln(this.args[1]);
  this.appname = "test";
  this.fields = this.args[1].split(",");
  this.title = this.args[2];
  this.labels = this.args[3].split(",");
  this.template('modal.html', path.join('app/templates/forms/', this.name + '-modal.html', this.args));

};
