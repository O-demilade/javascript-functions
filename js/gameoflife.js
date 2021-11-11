const core = require("jscodeshift");

function seed() {
  return([...arguments]);
};

function same([x, y], [j, k]) {
  // check if the arrays are the same
  return((x===j)&&(y===k));
};

// The game state to search for `cell` is passed as the `this` value of the function.
function contains(cell) {
  for(let i = 0; i<this.length; i++){
    if(cell[0]===this[i][0] && cell[1]===this[i][1]){
      return(true);
    };
  };
};

const printCell = (cell, state) => {
  if(contains.call(state, cell)){
    return "\u25A3";
  }else{return "\u25A2";};
};

const corners = (state = []) => {
  // default for an empty state
  if (state[0] == undefined){
    return({topRight:[0,0], bottomLeft:[0,0]});
  }else{
    let x = [];
    let y = [];

    //input all available x and y coordinates into 1 array list resp.
    for(let i=0; i<state.length; i++){
      x.push(state[i][0]);
      y.push(state[i][1]);
    };
    let x_max = x.sort()[x.length-1];
    let x_min = x.sort()[0];
    let y_max = y.sort()[y.length-1];
    let y_min = y.sort()[0];
    return({topRight:[x_max,y_max], bottomLeft:[x_min,y_min]})
  }
};

const printCells = (state) => {
  let corners_ = corners(state);
  let out = "";

  for(let r=corners_.topRight[1]; r>corners_.bottomLeft[1]-1; r--){
    for(let c=corners_.bottomLeft[0]; c<corners_.topRight[0]+1; c++){
      out += `${printCell([c,r], state)}`;
    }
    out += `\n`;
  }
  return(out);
};

const getNeighborsOf = ([x, y]) => {
  let cube = [];
  // get a 3x3 cube of cells housing the reference cell
  for(let r=(x-1); r<(x+2); r++){
    for(let c=(y-1); c<(y+2); c++){
      cube.push([r,c]);
    }
  }
  cube.splice(-5,1); // remove the reference cell from the cube list
  return cube;
};

const getLivingNeighbors = (cell, state) => {
  let liveNeighbors = [];
  let contains_ = contains.bind(state);
  let neighbors = getNeighborsOf(cell);
  for(let i=0; i<8; i++){
    if(contains_(neighbors[i])){
      liveNeighbors.push(neighbors[i]);
    };
  }
  return(liveNeighbors);
};

const willBeAlive = (cell, state) => {
  let liveNeighbors = getLivingNeighbors(cell, state);
  if(liveNeighbors.length === 3){
    return(true);
  }else if(contains.call(state, cell) && liveNeighbors.length === 2 ){
    return true;
  }else{return false;};
};

const calculateNext = (state) => {
  let corners_ = corners(state);

  //expand the state size by 1 offset
  corners_.topRight[0] += 1;
  corners_.topRight[1] += 1;
  corners_.bottomLeft[0] -= 1;
  corners_.bottomLeft[1] -= 1;

  let cellsToCheck = [];
  for(let r=corners_.topRight[1]; r>corners_.bottomLeft[1]-1; r--){
    for(let c=corners_.bottomLeft[0]; c<corners_.topRight[0]+1; c++){
      cellsToCheck.push([c,r]);
    }
  };

  let nextState = [];
  for(let i=0; i<cellsToCheck.length; i++){
    if(willBeAlive(cellsToCheck[i],state)){
      nextState.push(cellsToCheck[i]);
    };
  }
  return(nextState);
};

const iterate = (state, iterations) => {
  if(typeof(2) == "number"){
    let states = [state];
    for(let i=0; i<iterations; i++) {
      state = calculateNext(state);
      states.push(state);
    }
    return(states);
  };
};

const main = (pattern, iterations) => {
  let a = (iterate(startPatterns[pattern],iterations));
  let b = "";
  for(let i=0; i<a.length; i++){
    b += `${printCells(a[i])}\n`;
  };
  console.log(b);
};

const startPatterns = {
    rpentomino: [
      [3, 2],
      [2, 3],
      [3, 3],
      [3, 4],
      [4, 4]
    ],
    glider: [
      [-2, -2],
      [-1, -2],
      [-2, -1],
      [-1, -1],
      [1, 1],
      [2, 1],
      [3, 1],
      [3, 2],
      [2, 3]
    ],
    square: [
      [1, 1],
      [2, 1],
      [1, 2],
      [2, 2]
    ]
  };
  
  const [pattern, iterations] = process.argv.slice(2);
  const runAsScript = require.main === module;
  
  if (runAsScript) {
    if (startPatterns[pattern] && !isNaN(parseInt(iterations))) {
      main(pattern, parseInt(iterations));
    } else {
      console.log("Usage: node js/gameoflife.js rpentomino 50");
    }
  }
  
  exports.seed = seed;
  exports.same = same;
  exports.contains = contains;
  exports.getNeighborsOf = getNeighborsOf;
  exports.getLivingNeighbors = getLivingNeighbors;
  exports.willBeAlive = willBeAlive;
  exports.corners = corners;
  exports.calculateNext = calculateNext;
  exports.printCell = printCell;
  exports.printCells = printCells;
  exports.startPatterns = startPatterns;
  exports.iterate = iterate;
  exports.main = main;