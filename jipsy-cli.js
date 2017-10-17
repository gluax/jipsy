let repl = require('repl');
let jipsy = require('./jipsy');

repl.start({
  prompt:"jipsy> ",
  eval: (cmd, context, file, callback) => {
    if(cmd !== "(\n)") {
      cmd = cmd.slice(0, -1);
      let ret = jipsy.interpret(jipsy.parse(cmd));
      callback(null, ret);
    } else {
      callback(null);
    }
  }
});
