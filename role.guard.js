config = require('config');

let guard = module.exports;
guard.run = function(creep) {
    let spawn1 = Game.rooms[creep.memory.home].find(FIND_MY_SPAWNS)[0];
    let controller = Game.rooms[creep.memory.home].controller;
    
    // if(true){//config.targetRoom) {
    //     let targetRoom = 'W5N3';//config.targetRoom;
    //     if(!(creep.room.name == targetRoom)) {
    //         creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(targetRoom)));
    //         return;
    //     }
    // }
    
    let target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
    if(target) {
        creep.say('die!');
        if(creep.attack(target) != OK && creep.rangedAttack(target) != OK) {
            creep.moveTo(target);
        }
    } else {
        creep.moveTo(controller);//Game.flags['guardPost']);
    }
};
guard.base = [TOUGH,MOVE,ATTACK];
guard.add = {
    0: { type: TOUGH, amt: 11},
    1: { type: TOUGH, amt: 11},
    2: { type: ATTACK, amt: 7},
    3: { type: MOVE, amt: 19},
};