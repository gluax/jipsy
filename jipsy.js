const library = {
  first: (list) => {
    //gets first item of list
    
    if(!(list instanceof Array)) {
      return `Error: non-list type`;
    }
    
    return list[0];
  },
  
  rest: (list) => {
    //cuts of the first element of the list

    if(!(list instanceof Array)) {
      return `Error: non-list type`;
    }
    
    return list.slice(1);
  },
  
  print: (param) => {
    //prints the argument and returns it
    
    console.log(param);
    return param;
  }
};

let written_funcs = {};
let written_funcs_logic = {};

const lisp_functions = {
  '+': (input, context) => {
    let nums = input.splice(1);
    
    nums.forEach((part, pos) => {
      if(part instanceof Array) {
        nums[pos].value = interpret(part, context);
      }
    });
    
    let answer = {type: 'number'};
    answer.value = nums.reduce((accum, curr) => {
      return accum + curr.value;
    }, 0);

    return interpret(answer, context);
  },

  '-': (input, context) => {
    let nums = input.splice(2);
    
    nums.forEach((part, pos) => {
      if(part instanceof Array) {
        nums[pos].value = interpret(part, context);
      }
    });
    
    let answer = {type: 'number'};
    answer.value = nums.reduce((accum, curr) => {
      return accum - curr.value;
    }, interpret(input[1], context));

    return interpret(answer, context);
  },

  '*': (input, context) => {
    let nums = input.splice(2);
    
    nums.forEach((part, pos) => {
      if(part instanceof Array) {
        nums[pos].value = interpret(part, context);
      }
    });
    
    let answer = {type: 'number'};
    answer.value = nums.reduce((accum, curr) => {
      return accum * curr.value;
    }, interpret(input[1], context));

    return interpret(answer, context);
  },

  '/': (input, context) => {
    let nums = input.splice(2);

    nums.forEach((part, pos) => {
      if(part instanceof Array) {
        nums[pos].value = interpret(part, context);
      }
    });
    
    let answer = {type: 'number'};
    answer.value = nums.reduce((accum, curr) => {
      return accum / curr.value;
    }, interpret(input[1], context));

    return interpret(answer, context);
  },

  '%': (input, context) => {
    let nums = input.splice(2);

    nums.forEach((part, pos) => {
      if(part instanceof Array) {
        nums[pos].value = interpret(part, context);
      }
    });
    
    let answer = {type: 'number'};
    answer.value = nums.reduce((accum, curr) => {
      return accum % curr.value;
    }, interpret(input[1], context));

    return interpret(answer, context);
  },

  defun: (input, context) => {
    const func = input[1].value;
    const args = input[2];
    const logic = input[3];

    let send_params = {};
    
    if(!(func in written_funcs)) {

      written_funcs_logic[func] = logic;
      
      written_funcs[func] = (params) => {
        
        if(args.length !== params.length) {
          throw Error(`Expected ${args.length} number of arguments but received ${params.length}.`);
        }

        for(pos in params) {
          send_params[args[pos].value] = params[pos].value;
        }
        
        let answer = interpret(parse(build_logic(written_funcs_logic[func], send_params)));
        return answer;
      };
    } else {
      return Error(`Function ${func} already defined`);
    }
    
  },
  
  lambda: (input, context) => {
    return function() {
        var args = arguments;
        var scope = input[1].reduce((acc, cur, pos) => {
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
    if (identifier in this.scope) {
      return this.scope[identifier];
    } else if (this.parent !== undefined) {
      return this.parent.get(identifier);
    }
  };
}

const build_logic = (logic, params) => {
  //creates deep copy
  let copy = JSON.parse(JSON.stringify(logic));

  copy.forEach((item) => {
    if(item.value in params) {
      item.value = params[item.value];
    }
  });

  let final = copy.splice(1).reduce((accum, param) => {
    
    if(param instanceof Array) {
      param.value = interpret(parse(build_logic(param, params)));
    }
    
    return accum + ` ${param.value}`;
  }, `(${copy[0].value}`);
  final += ')';
  
  return final;
};

const interpretList = (input, context) => {
  const ident_val = input[0].value;
  console.log('in', input);
  
  if (input.length > 0 && ident_val in lisp_functions) {
    return lisp_functions[ident_val](input, context);
  } else if (input.length > 0 && ident_val in written_funcs) {
    const params = input.splice(1);
    return written_funcs[ident_val].call(undefined, params);
  } else {
    let interpreted_values = input.map( (cur) => {
      return interpret(cur, context);
    });
    
    if (interpreted_values[0] instanceof Function) {
      return interpreted_values[0].apply(undefined, interpreted_values.slice(1));
    } else {
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
  } else if (input.type === "frac") {
    return `${input.num}/${input.denom}`;
  }
};

const categorize = (input) => {
  if(!isNaN(parseFloat(input))) {
    return { type: 'number', value: parseFloat(input) };
  } else if (input[0] === '"' && input.slice(-1) === '"') {
    return { type: 'string', value: input.slice(1,-1) };
  } else {
    return { type: 'identifier', value: input };
  }
};

const parenthesize = (input, list) => {
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
