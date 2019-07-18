config = require('config');

var guard =  {
    run: function(creep) {
        var spawn1 = Game.rooms[creep.memory.home].find(FIND_MY_SPAWNS)[0];
        var controller = Game.rooms[creep.memory.home].controller;
        
        // if(true){//config.targetRoom) {
        //     var targetRoom = 'W5N3';//config.targetRoom;
        //     if(!(creep.room.name == targetRoom)) {
        //         creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(targetRoom)));
        //         return;
        //     }
        // }
        
        var target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
        if(target) {
            creep.say('die!');
            if(creep.attack(target) != OK && creep.rangedAttack(target) != OK) {
                creep.moveTo(target);
            }
        } else {
            creep.moveTo(controller);//Game.flags['guardPost']);
        }
    },
    base: [TOUGH,MOVE,ATTACK],
    add: {
        0: { type: TOUGH, amt: 11},
        1: { type: TOUGH, amt: 11},
        2: { type: ATTACK, amt: 7},
        3: { type: MOVE, amt: 19},
    }
}

module.exports = guard;