function Cell(row, col) {

    var _row = row, _col = col;
    
    this.links = {};
    this.north = false;
    this.east = false;
    this.south = false;
    this.west = false;

    this.id = row + "," + col;
    
    this.link = function(cell, bidirectional) {
        this.links[cell.id] = true;

        if (bidirectional === undefined || bidirectional) {
            cell.link(this, false);
        }

        return this;
    };

    this.unlink = function(cell, bidirectional) {
        delete this.links[cell.id];

        if (bidirectional === undefined || bidirectional) {
            cell.unlink(this, false);
        }

        return this;
    };

    this.getLinks = function() {
        return Object.keys(this.links);
    };

    this.isLinked = function(cell) {
        return cell.id in this.links;
    };

    this.neighbours = function() {
        var output = [];
        if (this.north) output.push(this.north);
        if (this.east) output.push(this.east);
        if (this.south) output.push(this.south);
        if (this.west) output.push(this.west);
        return output;
    };

    this.cut = function(direction, other) {
        this[direction] = false;
        other[oppositeDirection(direction)] = false;
        
    }
}

function oppositeDirection(dir) {
    switch (dir) {
    case "east": return "west";
    case "west": return "east";
    case "north": return "south";
    case "south": return "north";
    }
}

function Grid(rows, cols) {

    var _rows = rows, _cols = cols;

    function createGrid() {
        var output = new Array(_rows);
        for (var row = 0; row < _rows; row++) {
            output[row] = new Array(_cols);
            for (var col = 0; col < _cols; col++) {
                output[row][col] = new Cell(row, col);
            }
        }
        return output;
    };


    this.configureCells = function() {
        for (var row = 0; row < _rows; row++) {
            for (var col = 0; col < _cols; col++) {
                if (row + 1 < _rows) {
                    this.grid[row][col].south = this.grid[row + 1][col];
                }
                if (row - 1 >= 0) {
                    this.grid[row][col].north = this.grid[row - 1][col];
                }
                if (col + 1 < _cols) {
                    this.grid[row][col].east = this.grid[row][col + 1];
                }
                if (col - 1 >= 0) {
                    this.grid[row][col].west = this.grid[row][col - 1];
                }
            }
        }
    };

    this.grid = createGrid();

    this.configureCells();


    this.size = function() {
        return _rows * _cols;
    };

    this.eachCell = function(callback) {
        this.grid.forEach(function(col) {
            col.forEach(callback);
        });
    };

    this.eachRow = function(callback) {
        this.grid.forEach(callback);
    };

    this.toString = function() {
        var output = "+";
        for (var col = 0; col < _cols; col++) {
            output+= "---+";
        }
        output+= "\n";

        for (var row = 0; row < _rows; row++) {
            var top = row == 0 ? " " : "|";
            var bottom = "+";

            for (var col = 0; col < _cols; col++) {

                var cell = this.grid[row][col];
                
                
                var body = "   ";
                var east_boundary = cell.isLinked(cell.east) ? " " : "|";

                if (col == _cols - 1 && row == _rows - 1) {
                    east_boundary = " ";
                }
                
                top+= body + east_boundary;

                var south_boundary = cell.isLinked(cell.south) ? "   " : "---";
                var corner = "+";
                bottom+= south_boundary + corner;
            }

            output += top + "\n";
            output += bottom + "\n";
        }

        return output;
    };

    
    
}

Array.prototype.sample = function () {
    return this[Math.floor(Math.random() * this.length)]
}

function BinaryTree() {

    this.on = function(grid) {

        grid.eachCell(function(cell) {
            var neighbours = [];
            if (cell.north) {
                neighbours.push(cell.north);
            }
            if (cell.east) {
                neighbours.push(cell.east);
            }

            var neighbour = neighbours.sample();

            if (neighbour) {
                cell.link(neighbour);
            }

        });
        
    };
    
}

function Sidewinder() {
    this.on = function(grid) {

        grid.eachRow(function(row) {

            var run = [];

            row.forEach(function(cell) {
                run.push(cell);

                var at_east_boundary = cell.east == false;
                var at_north_boundary = cell.north == false;

                var should_close = at_east_boundary ||
                    (!at_north_boundary && Math.floor(Math.random() * 2) == 0);

                if (should_close) {
                    var member = run.sample();
                    if (member.north) {
                        member.link(member.north);
                    }
                    run = [];
                }
                else {
                    cell.link(cell.east);
                }
            });
        });
    };
}



function Graph() {
    // i, j == x, y == col, row
    
    var data = {};

    this.toId = function(i, j) {
        return j + "," + i;
    };

    this.get = function(i, j) {
        var id = this.toId(i, j);
        if (data[id] === undefined) {
            data[id] = new Cell(j, i);
        }
        return data[id];
    };

    this.toString = function() {
        return data;
    };

    function getKeyParts(key) {
        var parts = key.split(",");
        return {
            "i": parseInt(parts[1]),
            "j": parseInt(parts[0]),
        };
    }

    this.configure = function() {
        for (var key in data) {
            var currentParts = getKeyParts(key);
            var currentCell = data[key];
            for (var okey in currentCell["links"]) {
                var parts = getKeyParts(okey);
                if (parts.i == currentParts.i + 1) {
                    currentCell.east = this.toId(parts.i, currentParts.j);
                }
                else if (parts.i == currentParts.i - 1) {
                    currentCell.west = this.toId(parts.i, currentParts.j);
                }

                if (parts.j == currentParts.j + 1) {
                    currentCell.south = this.toId(currentParts.i, parts.j);
                }
                else if (parts.j == currentParts.j - 1) {
                    currentCell.north = this.toId(currentParts.i, parts.j);
                }
            }
        }
    };

    this.go = function() {

        var currentCell = this.get(0, 0), lastCell = null;
        var direction = "east";

        var directions = ["east", "south", "west", "north"];
        var directionIndex = 0;
        
        function currentDirection() {
            return directions[directionIndex];
        }

        function switchDirection() {
            directionIndex = (directionIndex + 1) % directions.length;
            return directionIndex !== 0;
        }

        var paths = [[]];
        var currentPath = 0;
        
        function addPoint(cellId) {
            paths[currentPath].push(cellId);
        }

        function addPath() {
            paths.push([]);
            currentPath++;
        }


        function dive(cell, switched) {

            var dir = currentDirection();
            
            if (cell[dir]) {
                // we're can go in the current direction
                var next = data[cell[dir]];

                // remove connections between us and next
                cell.cut(dir, next);

                // log the point
                addPoint(cell.id);

                // move on!
                dive(next);
            }
            else {
                // we need to try a new direction
                switchDirection();

                // don't log a point if we switched one step before
                if (switched === undefined) {
                    addPoint(cell.id);
                }

                // if we have somewhere to go, try!
                if (cell.neighbours().length > 0) {
                    dive(cell, true);                    
                }

            }

            // we are now backtracking
            // if there are undiscovered places, go for it.
            if (cell.neighbours().length > 0) {
                addPath();
                dive(data[cell.id], true);
            }


        }
        

        // addPoint(currentCell.id);
        dive(currentCell);

        console.log(paths);

        // the next phase is to remove the intermediate steps where the line
        // is straight

        
        
        return paths;
    };
    
}

function parse(maze) {

    var lines = maze.trim().split("\n");

    var numHLines = Math.ceil(lines.length / 2);
    var numVLines = null;
    var graph = new Graph();

    
    var currentJ = 0; // row (in nodes)
    var step = 4;
    
    lines.forEach(function(line, lineNum) {
        
        var lineList = line.split('');
        
        var numNodes = Math.ceil(lineList.length / step);
        if (!numVLines) {

            if (lineList.length % 2 == 0) {
                throw "Invalid line, length is even";
            }
            
            numVLines = numNodes;
        }
        else {
            if (numVLines != numNodes) {
                throw "Line length mismatch, was " + numVLines + ", now " + numNodes;
            }
        }

        if (lineNum % 2 == 0) {

            if (lineList[0] !== "+") {
                throw "Bad start character, looking for +, received " + lineList[0];
            }
            
            for (var i = 1; i < lineList.length; i+= step) {
                if (lineList[i] == "-") {
                    var current = graph.get(Math.floor(i / step), currentJ);
                    var next = graph.get(Math.ceil(i / step), currentJ);
                    current.link(next);
                }
            }
        }
        else {
            for (var i = 0; i < lineList.length; i+= step) {
                if (lineList[i] == "|") {
                    graph.get(i / step, currentJ).link(graph.get(i / step, currentJ + 1));
                }
            }
            currentJ++;
        }
    });

    graph.configure();

    return graph;
}

var grid = new Grid(5, 5);
// new BinaryTree().on(grid);
new Sidewinder().on(grid);

console.log(grid + "");

var graph = parse(grid.toString());
// console.log(graph.toString());
graph.go();
