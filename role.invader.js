var invader =  {
    run: function(creep) {
        var spawn1 = Game.rooms[creep.memory.home].find(FIND_MY_SPAWNS)[0];
        var targetRoom = 'W1N1';
        if(creep.room.name == targetRoom) {
            var target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
            if(target) {
                creep.say('die!!');
                if(creep.rangedAttack(target) != OK && creep.attack(target) != OK) {
                    creep.moveTo(target);
                    return;
                }
            } else {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => {
                        return (s.structureType == STRUCTURE_TOWER);
                }});
                if(!target) {
                    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => {
                        return (s.structureType == STRUCTURE_SPAWN);
                }});
                }
                if(!target) {
                    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => {
                        return (s.structureType == STRUCTURE_EXTENSION);
                }});
                }
                if(!target) target = creep.room.controller;
                creep.say('destroy!!');
                if(creep.rangedAttack(target) != OK && creep.attack(target) != OK) {
                    creep.moveTo(target);
                }
            }
        } else {
            var h = creep.pos.findInRange(FIND_HOSTILE_CREEPS,5);
            if(h.length) {
                creep.say('die!!');
                h = h[0];
                if(creep.rangedAttack(h) != OK && creep.attack(h) != OK) {
                    creep.moveTo(h);
                    return;
                }
            }
            creep.moveTo(creep.pos.findClosestByPath(creep.room.findExitTo(targetRoom)), {reusePath: 25, swampCost: 2});
        }
    },
    base: [TOUGH,MOVE,ATTACK],
    add: {
        0: { type: ATTACK, amt: 7},
        1: { type: MOVE, amt: 19},
        2: { type: TOUGH, amt: 11},
        3: { type: TOUGH, amt: 11}
    }
}

module.exports = invader;