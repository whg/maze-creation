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
    };

    this.unlink = function(cell, bidirectional) {
        delete this.links[cell.id];

        if (bidirectional === undefined || bidirectional) {
            cell.unlink(this, false);
        }
    };

    this.getLinks = function() {
        return Object.keys(this.links);
    };

    this.isLinked = function(cell) {
        return cell.id in this.links;
    };

    this.neighbours = function() {
        var output = [];
        if (this.north) output.push(north);
        if (this.east) output.push(east);
        if (this.south) output.push(south);
        if (this.west) output.push(west);
        return output;
    };
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
            var top = "|";
            var bottom = "+";

            for (var col = 0; col < _cols; col++) {

                var cell = this.grid[row][col];
                
                
                var body = "   ";
                var east_boundary = cell.isLinked(cell.east) ? " " : "|";
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

var grid = new Grid(14, 14);
// new BinaryTree().on(grid);
new Sidewinder().on(grid);

console.log(grid + "a");
