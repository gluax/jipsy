/* @file jipsy.js
 * @author Jonathan Pavlik
 *
 */
const library = {
  /*
   * @function first
   * @param {identifier[]} list - A list of identifiable types.
   *
   * @return {identifier} the first element of a list.
   */
  first: function (list) {
    //gets first item of list
    
    if(!(list instanceof Array)) {
      return `Error: non-list type`;
    }
    
    return list[0];
  },

  /*
   * @function rest
   * @param {identifier[]} list - A list of identifiable types.
   *
   * @return {identifier[]} the rest of a list.
   */
  rest: function (list) {
    //cuts of the first element of the list

    if(!(list instanceof Array)) {
      return `Error: non-list type`;
    }
    
    return list.slice(1);
  },

  /*
   * @function print
   * @param {identifier} the type to be printed.
   *
   * @return {identifier} they type being printed.
   */
  print: function (param) {
    //prints the argument and returns it
    
    console.log(param);
    return param;
  }
};

//for storing user written functions and their logic
let written_funcs = {};
let written_funcs_logic = {};

//for storing all lisp functions
const lisp_functions = {
  /*
   * @function +
   * Adds all numbers in a list
   * @param {identifier[]} input - A list of identifiable types, presumably numbers.
   * @param {object} context - the context of a identifier.
   *
   * @return {identifer} with a type of number.
   */
  '+': function (input, context) {
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

  /*
   * @function -
   * Subtracts all numbers in a list
   * @param {identifier[]} input - A list of identifiable types, presumably numbers.
   * @param {object} context - the context of a identifier.
   *
   * @return {identifer} with a type of number.
   */
  '-': function (input, context) {
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

  /*
   * @function *
   * Multiplies all numbers in a list
   * @param {identifier[]} input - A list of identifiable types, presumably numbers.
   * @param {object} context - the context of a identifier.
   *
   * @return {identifer} with a type of number.
   */
  '*': function (input, context) {
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

  /*
   * @function /
   * Divides all numbers in a list
   * @param {identifier[]} input - A list of identifiable types, presumably numbers.
   * @param {object} context - the context of a identifier.
   *
   * @return {identifer} with a type of number.
   */
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

  /*
   * @function %
   * Modulos all numbers in a list
   * @param {identifier[]} input - A list of identifiable types, presumably numbers.
   * @param {object} context - the context of a identifier.
   *
   * @return {identifer} with a type of number.
   */
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

  /*
   * @function defun
   * let's the user define a function
   * @param {identifier[]} list - A list of identifiable types
   * @param {object} context - the context of a identifier.
   *
   * @return {string} an error message if there is an error with the syntax.
   */
  defun: function (input, context) {
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

  /*
   * @function if
   * provides if logic
   * @param {identifier[]} list - A list of identifiable types
   * @param {object} context - the context of a identifier.
   *
   * @return {indentifier} the code that will be run.
   */
  if: function (input, context) {
    return interpret(input[1], context) ?
      interpret(input[2], context) :
      interpret(input[3], context);
  },

  /*
   * @function eq
   * provides equal logic
   * @param {identifier[]} list - A list of identifiable types
   * @param {object} context - the context of a identifier.
   *
   * @return {indentifier} whether two things are equal
   */
  eq: function (input, context) {
    let args = input.splice(1);
    
    if(args.length > 2) {
      return `Error: can not compare more than 2 args and recieved ${args.length}`;
    }
    
    let answer = {type: 'boolean'};
    answer.value = interpret(args[0], context) === interpret(args[1], context);
    return interpret(answer, context);
  },

  /*
   * @function neq
   * provides not equal logic
   * @param {identifier[]} list - A list of identifiable types
   * @param {object} context - the context of a identifier.
   *
   * @return {indentifier} whether two things are not equal
   */
  neq: function (input, context) {
    let args = input.splice(1);
    
    if(args.length > 2) {
      return `Error: can not compare more than 2 args and recieved ${args.length}`;
    }
    
    let answer = {type: 'boolean'};
    answer.value = interpret(args[0], context) !== interpret(args[1], context);
    return interpret(answer, context);
  },

  /*
   * @function lt
   * provides less than logic
   * @param {identifier[]} list - A list of identifiable types
   * @param {object} context - the context of a identifier.
   *
   * @return {indentifier} whether one thing is less than another
   */
  lt: function (input, context) {
    let args = input.splice(1);
    
    if(args.length > 2) {
      return `Error: can not compare more than 2 args and recieved ${args.length}`;
    }
    
    let answer = {type: 'boolean'};
    answer.value = interpret(args[0], context) < interpret(args[1], context);
    return interpret(answer, context);
  },

  /*
   * @function lte
   * provides less than equal to logic
   * @param {identifier[]} list - A list of identifiable types
   * @param {object} context - the context of a identifier.
   *
   * @return {indentifier} whether one thing is less than or equal to another
   */
  lte: function (input, context) {
    let args = input.splice(1);
    
    if(args.length > 2) {
      return `Error: can not compare more than 2 args and recieved ${args.length}`;
    }
    
    let answer = {type: 'boolean'};
    answer.value = interpret(args[0], context) <= interpret(args[1], context);
    return interpret(answer, context);
  },

  /*
   * @function gt
   * provides greater than logic
   * @param {identifier[]} list - A list of identifiable types
   * @param {object} context - the context of a identifier.
   *
   * @return {indentifier} whether one thing is greater than another
   */
  gt: function (input, context) {
    let args = input.splice(1);
    
    if(args.length > 2) {
      return `Error: can not compare more than 2 args and recieved ${args.length}`;
    }
    
    let answer = {type: 'boolean'};
    answer.value = interpret(args[0], context) > interpret(args[1], context);
    return interpret(answer, context);
  },

  /*
   * @function gte
   * provides greater than equal to logic
   * @param {identifier[]} list - A list of identifiable types
   * @param {object} context - the context of a identifier.
   *
   * @return {indentifier} whether one thing is greater than or equal to another
   */
  gte: function (input, context) {
    let args = input.splice(1);
    
    if(args.length > 2) {
      return `Error: can not compare more than 2 args and recieved ${args.length}`;
    }
    
    let answer = {type: 'boolean'};
    answer.value = interpret(args[0], context) >= interpret(args[1], context);
    return interpret(answer, context);
  },

  let: function (input, context) {
    let let_cont = input[1].reduce((cur, accum) => {
      accum.scope[cur[0].value] = interpret(cur[1], context);
      return accum;
    }, new Context({}, context));

    return interpret(input[2], context);
  }
};

/*
 * @class Context
 * allows us to define a type known as context, that gives a param its scope and parent
 *
 */
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

/*
 * @function build_logic
 * builds the logic for a function
 * @param {function} logic - The logic for a function
 * @param {identifier[]} params - the list of identifiers that are the paremeters for the function. 
 *
 * @return {string} the function logic
 */
function build_logic (logic, params) {
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

/*
 * @function interpretList
 * interprets a lisp list
 * @param {identifier[]} input - A list of identifiable types.
 * @param {object} context - the context of a identifier.
 *
 * @return the interpretation of a lisp list/funct
 */
function interpretList (input, context) {
  const ident_val = input[0].value;
  //console.log('in', input);
  
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

/*
 * @function interpret
 * interprets a lisp element
 * @param {identifier} input - an type to be identified
 * @param {object} context - the context of a identifier.
 *
 * @return the interpretation of a lisp element
 */
function interpret(input, context) {
  if (context === undefined) {
    return interpret(input, new Context(library));
  } else if (input instanceof Array) {
    return interpretList(input, context);
  } else if (input.type === "identifier") {
    return context.get(input.value);
  } else if (input.type === "number" || input.type === "string") {
    return input.value;
  } else if (input.type === "boolean") {
    return input.value;
  }
};

/*
 * @function categorize
 * identifies the type of element in a lisp list
 * @param {identifier} input an element
 *
 * @return {object} containg the type and value of an element
 */
function categorize(input) {
  if(!isNaN(parseFloat(input))) {
    return { type: 'number', value: parseFloat(input) };
  } else if (input[0] === '"' && input.slice(-1) === '"') {
    return { type: 'string', value: input.slice(1,-1) };
  } else {
    return { type: 'identifier', value: input };
  }
};

/*
 * @function parenthesise
 * makes sure the lisp expression is properly parenthesized 
 * @param {string} input - the input string
 * @param {character} list - of characters to keep track
 *
 * @return the sub lists within a lisp expression
 */
function parenthesize(input, list) {
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

/*
 * @function tokenize
 * tokenizes the function
 * @param {string} input - properly parses a string
 *
 * @return the parsed string
 */
function tokenize(input) {
  
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

/*
 * @function parse
 * parses the function
 * @param {string} input - properly parses a string
 *
 * @return the evaluted lisp
 */
function parse(input) {
  return parenthesize(tokenize(input));
};

module.exports = {
  parse: parse,
  interpret: interpret
};
