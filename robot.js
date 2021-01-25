const roads = [
    "Alice's House-Bob's House",   "Alice's House-Cabin",
    "Alice's House-Post Office",   "Bob's House-Town Hall",
    "Daria's House-Ernie's House", "Daria's House-Town Hall",
    "Ernie's House-Grete's House", "Grete's House-Farm",
    "Grete's House-Shop",          "Marketplace-Farm",
    "Marketplace-Post Office",     "Marketplace-Shop",
    "Marketplace-Town Hall",       "Shop-Town Hall"
  ];


function buildGraph(edges) {
    let graph = Object.create(null);
    function addEdge(from, to) {
      if (graph[from] == null) {
        graph[from] = [to];
      } else {
        graph[from].push(to);
      }
    }
    for (let [from, to] of edges.map(r => r.split("-"))) {
      addEdge(from, to);
      addEdge(to, from);
    }
    return graph;
  }
  
const roadGraph = buildGraph(roads);
/* 
{ 'Alice\'s House': [ 'Bob\'s House', 'Cabin', 'Post Office' ],
  'Bob\'s House': [ 'Alice\'s House', 'Town Hall' ],
  Cabin: [ 'Alice\'s House' ],
  'Post Office': [ 'Alice\'s House', 'Marketplace' ],
  'Town Hall': [ 'Bob\'s House', 'Daria\'s House', 'Marketplace', 'Shop' ],
  'Daria\'s House': [ 'Ernie\'s House', 'Town Hall' ],
  'Ernie\'s House': [ 'Daria\'s House', 'Grete\'s House' ],
  'Grete\'s House': [ 'Ernie\'s House', 'Farm', 'Shop' ],
  Farm: [ 'Grete\'s House', 'Marketplace' ],
  Shop: [ 'Grete\'s House', 'Marketplace', 'Town Hall' ],
  Marketplace: [ 'Farm', 'Post Office', 'Shop', 'Town Hall' ] }
*/ 


class VillageState {
    constructor(place, parcels) {
      this.place = place;
      this.parcels = parcels;
    }
  
    move(destination) {
      if (!roadGraph[this.place].includes(destination)) {
        return this;
      } else {
          console.log(this.parcels);
        let parcels = this.parcels.map(p => {
          console.log(p);
          //Fail safe? Check later?
          if (p.place != this.place) return p;
          //Changing place to destination
          return {place: destination, address: p.address};
        //Filter, dropping off the parcels
        }).filter(p => {
            console.log(p);
            return p.place != p.address;
        });

        return new VillageState(destination, parcels);
      }
    }
  }

let first = new VillageState(
"Post Office",
[{place: "Post Office", address: "Alice's House"}]
);
let next = first.move("Alice's House");

console.log(next.place);
// → Alice's House
console.log(next.parcels);
// → []
console.log(first.place);
// → Post Office

function runRobot(state, robot, memory) {
    for (let turn = 0;; turn++) {
      if (state.parcels.length == 0) {
        console.log(`Done in ${turn} turns`);
        return turn;
      }
      let action = robot(state, memory);
      state = state.move(action.direction);
      memory = action.memory;
      console.log(`Moved to ${action.direction}`);
    }
  }


function randomPick(array) {
    let choice = Math.floor(Math.random() * array.length);
    return array[choice];
}

function randomRobot(state) {
    return {direction: randomPick(roadGraph[state.place])};
}  

VillageState.random = function(parcelCount = 5) {
    let parcels = [];
    for (let i = 0; i < parcelCount; i++) {
      let address = randomPick(Object.keys(roadGraph));
      let place;

      //making place and address not the same
      do {
        place = randomPick(Object.keys(roadGraph));
      } while (place == address);

      parcels.push({place, address});
    }
    return new VillageState("Post Office", parcels);
  };

//runRobot(VillageState.random(), randomRobot)

const mailRoute = [
    "Alice's House", "Cabin", "Alice's House", "Bob's House",
    "Town Hall", "Daria's House", "Ernie's House",
    "Grete's House", "Shop", "Grete's House", "Farm",
    "Marketplace", "Post Office"
];

function routeRobot(state, memory) {
    if (memory.length == 0) {
      memory = mailRoute;
    }
    return {direction: memory[0], memory: memory.slice(1)};
  }

runRobot(VillageState.random(), routeRobot, []);

function findRoute(graph, from, to) {
    let work = [{at: from, route: []}];
    for (let i = 0; i < work.length; i++) {
      let {at, route} = work[i];

      for (let place of graph[at]) {
          //if a place 1 road away is possible, make that the route
        if (place == to) return route.concat(place);
        //no fastest case scenarios
        if (!work.some(w => w.at == place)) {
          work.push({at: place, route: route.concat(place)});
        }
      }
    }
  }

let route = findRoute(roadGraph, 'Daria\'s House', 'Post Office');
console.log(route);

function goalOrientedRobot({place, parcels}, route) {
    if (route.length == 0) {
      let parcel = parcels[0];
      if (parcel.place != place) {
        route = findRoute(roadGraph, place, parcel.place);
      } else {
        route = findRoute(roadGraph, place, parcel.address);
      }
    }
    return {direction: route[0], memory: route.slice(1)};
  }

function goalOrientedRobotV2({place, parcels}, route) {
    if (route.length == 0) {
        let minRoute = Infinity;
        let parcelsArray = parcels.map( p => {
            console.log(p)
            route = findRoute(roadGraph, place, p.address);
            return {place: p.place, address: p.address, length: route.length}
        });

        let parcel = parcelsArray.sort((a,b) => a.length - b.length)[0];
        
        if (parcel.place != place) {
            route = findRoute(roadGraph, place, parcel.place);
        } else {
            route = findRoute(roadGraph, place, parcel.address);
        }
    }
    return {direction: route[0], memory: route.slice(1)};
    }

function compareRobots(robot1, memory1, robot2, memory2) {
    let robot1Turns = 0;
    let robot2Turns = 0;
    for (let i = 0; i < 100; i++){
        robot1Turns += runRobot(VillageState.random(), robot1, []);
        robot2Turns += runRobot(VillageState.random(), robot2, []);
        console.log(robot1Turns);
        console.log(robot2Turns);
    }
    console.log(robot1Turns);
    console.log(robot2Turns);
    return {"r1": robot1Turns/100, "r2": robot2Turns/100};
}

let {r1, r2} = compareRobots(goalOrientedRobotV2, [], goalOrientedRobot, []);