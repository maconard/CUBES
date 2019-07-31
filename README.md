# CUBES
Creeps Utilizing Basic Evaluation Scripts: a Screeps AI.

### What is Screeps?
[Screeps](https://screeps.com/) is a game where the core gameplay mechanic is writing actual 
JavaScript or TypeScript code that controls your units, called Creeps.

### How does this AI work?
This particular AI is simple, and doesn't have any unique traits that it tries to exhibit.
The code execution is `task` based, meaning that each task is executed for each room on each
game tick (see [main.js](https://github.com/maconard/CUBES/blob/master/main.js)).

Rather than having a queue of actions to accomplish and assigning them to Creeps, each Creep is 
born with a role that they uphold, in which they perform certain tasks. Creeps perform their role
when the `creeps` task is executed for a room. There are other tasks, such as `manage` which performs
base building and `towers` which controls the towers.

The Creeps will be born larger and more powerful depending on the amount of energy available in
the room. Structures like roads, extenders, extractors, terminals, spawns, and towers are
placed and built autonomously. 

It supports rudimentary market use, as it can complete other players' buy orders for minerals 
it has excess of, but will not create its own buy or sell orders.

### TODO
1. Auto-place Containers
2. Auto-place Storage
3. Auto-place and use Labs
4. Autonomously claim new rooms (currently the player must indicate a room)

# Files

### Roles

### Tasks

### Other
