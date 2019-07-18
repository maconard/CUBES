var priority = {
    [STRUCTURE_SPAWN]: 20,
    [STRUCTURE_CONTROLLER]: 19,
    [STRUCTURE_EXTENSION]: 18,
    [STRUCTURE_STORAGE]: 17,
    [STRUCTURE_CONTAINER]: 16,
    [STRUCTURE_RAMPART]: 15,
    [STRUCTURE_TOWER]: 14,
    [STRUCTURE_ROAD]: 13,
    [STRUCTURE_EXTRACTOR]: 12,
    [STRUCTURE_LAB]: 11,
    [STRUCTURE_WALL]: 10
}

var upgrader = require('role.upgrader');
var harvester = require('role.harvester');
var builder = require('role.builder');

var repairman =  {
    run: function(creep) {
        var spawn1 = Game.rooms[creep.memory.home].find(FIND_MY_SPAWNS)[0];
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if(creep.memory.working) {
            creep.say('repairing');
            var targets = _.toArray(creep.room.find(FIND_STRUCTURES, {
                filter: (s) => {
                    var dat = JSON.stringify({x:s.pos.x,y:s.pos.y});
                    var t = s.structureType;
                    return (((t != STRUCTURE_ROAD && t != STRUCTURE_WALL) && s.hits < 0.25 * s.hitsMax) ||
                            ((t != STRUCTURE_ROAD && t != STRUCTURE_WALL && 
                                t != STRUCTURE_RAMPART) && s.hits < s.hitsMax) ||
                            (t == STRUCTURE_ROAD && s.hits < s.hitsMax &&
                            (Memory.roomData[creep.room.name].travelData[dat] > 30)));
                }
            })).sort((a,b) => priority[b.structureType] - priority[a.structureType]);
            if(targets.length > 0) {
                if(creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                builder.run(creep);
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
                filter: (s) => {
                    return ((s.structureType == STRUCTURE_CONTAINER || 
                             s.structureType == STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] >= 50);
                }
            });
            if(target){
                if(creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});   
                }
            } else {
                // harvester.run(creep);
                creep.moveTo(spawn1.room.controller);
            }
        }
    },
    base: [WORK,CARRY,MOVE],
    add: {
        0: { type: WORK, amt: 12 },
        1: { type: CARRY, amt: 12 },
        2: { type: MOVE, amt: 23 }
    }
};

module.exports = repairman;