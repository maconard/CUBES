let cleric = module.exports;
cleric.run = function(creep) {
    let spawn1 = Game.rooms[creep.memory.home].find(FIND_MY_SPAWNS)[0];
    
};
cleric.base = [HEAL,MOVE];
cleric.add = {
    0: { type: HEAL, amt: 9},
    1: { type: MOVE, amt: 11},
    2: { type: TOUGH, amt: 2}
};