const library = {
  first: (list) => {
    return list[0];
  },
  rest: (list) => {
    return list.slice(1);
  },
  print: (param) => {
    //console.log(param);
    return param;
  }
};

const lisp_functions = {
  lambda: (input, context) => {
    return function() {
        var args = arguments;
        var scope = input[1].reduce(function(acc, cur, pos) {
          acc[cur.value] = args[pos];
          return acc;
        }, {});

        return interpret(input[2], new Context(scope, context));
      };
  },

  if: (input, context) => {
    return interpret(input[1], context) ?
      interpret(input[2], context) :
      interpret(input[3], context);
  },
  
  let: (input, context) => {
    let let_cont = input[1].reduce((cur, accum) => {
      accum.scope[cur[0].value] = interpret(cur[1], context);
      return accum;
    }, new Context({}, context));

    return interpret(input[2], context);
  }
};

class Context {
  constructor(scope, parent) {
    this.scope = scope;
    this.parent = parent;
  };

  get(identifier) {
    //console.log(`Ident: ${identifier}`);
    if (identifier in this.scope) {
      return this.scope[identifier];
    } else if (this.parent !== undefined) {
      return this.parent.get(identifier);
    }
  };
}

const interpretList = (input, context) => {
  
  if (input.length > 0 && input[0].value in lisp_functions) {
    //console.log("here?");
    return lisp_functions[input[0].value](input, context);
  } else {
    //console.log("here??");
    let interpreted_values = input.map( (cur) => {
      return interpret(cur, context);
    });

    if (interpreted_values[0] instanceof Function) {
      //console.log("here???");
      return interpreted_values[0].apply(undefined, interpreted_values.slice(1));
    } else {
      //console.log("here????");
      return interpreted_values;
    }
    
  }
};

const interpret = (input, context) => {
  if (context === undefined) {
    return interpret(input, new Context(library));
  } else if (input instanceof Array) {
    return interpretList(input, context);
  } else if (input.type === "identifier") {
    return context.get(input.value);
  } else if (input.type === "number" || input.type === "string") {
    return input.value;
  }
};

const categorize = (input) => {
  if(!isNaN(parseFloat(input))) {
    return { type: 'number', value: parseFloat(input) };
  } else if (input[0] === '"' && input.slice(-1) === '"') {
    return { type: 'string', value: input.slice(1,-1) };
  } else {
    //console.log(`input categorize: ${input}`);
    return { type: 'identifier', value: input };
  }
};

const parenthesize = (input, list) => {
  //console.log(`input: ${input}\nlist: ${list}`);
  if(list === undefined) {
    return parenthesize(input, []);
  } else {
    
    let token = input.shift();
    
    if(token === undefined) {
      //no token get the end of the list
      return list.pop();
    } else if (token === "(") {
      //beginning of a list
      list.push(parenthesize(input, []));
      return parenthesize(input, list);
    } else if (token === ")") {
      //end of a list
      return list;
    } else {
      //reccursively go through 
      return parenthesize(input, list.concat(categorize(token)));
    }
    
  }
};

const tokenize = (input) => {
  
  return input.split('"')
    .map((str, pos) => {
      //put a space around lists
      if(pos % 2 == 0) {
        //not in string
        return str.replace(/\(/g, ' ( ')
          .replace(/\)/g, ' ) ');
      } else {
        //replace all whitespace with characters
        return str.replace(/ /g, "!ws!");
      }
      
    })
    .join('"')
    .trim()
    .split(/\s+/)
    .map((str) => {
      //after rejoining all words replace temp ws character with
      //real whitespace
      return str.replace(/!ws!/g, " ");
    });
  
};

const parse = (input) => {
  return parenthesize(tokenize(input));
};

module.exports = {
  parse: parse,
  interpret: interpret
};
