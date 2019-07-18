var config = require('config');

var upgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var spawn1 = Game.rooms[creep.memory.home].find(FIND_MY_SPAWNS)[0];
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if(creep.memory.working) {
            creep.say('upgrading');
            if(config.upgradeTarget) {
                var targetRoom = config.upgradeTarget;
                if(!(creep.room.name == targetRoom)) {
                    creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(targetRoom)));
                    return;
                }
            }
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            creep.say('collecting');
            var t = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 7, {
                    filter: (r) => r.resourceType == RESOURCE_ENERGY});
            if(t.length > 0) {
                creep.pickup(t[0])
                creep.moveTo(t[0]);
                return;
            }
            
            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_CONTAINER || 
                                s.structureType == STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] >= 50});
            if(target) {
                if(creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            } else {
                // var source = creep.pos.findClosestByPath(FIND_SOURCES);
                // if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                //     if(creep.moveTo(source,{visualizePathStyle: {stroke: '#ffaa00'}}) == ERR_NO_PATH) {
                //     }
                // }
                creep.moveTo(spawn1.room.controller);
            }
        }
    },
    base: [WORK,CARRY,MOVE],
    add: {
        0: { type: WORK, amt: 12 },
        1: { type: CARRY, amt: 12 },
        // 2: { type: WORK, amt: 12},
        2: { type: MOVE, amt: 23 }
    }
};

module.exports = upgrader;