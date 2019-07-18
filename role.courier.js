var courier =  {
    run: function(creep) {
        var spawn1 = Game.rooms[creep.memory.home].find(FIND_MY_SPAWNS)[0];
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }
        
        if(creep.memory.working) {//depositing energy
            creep.say("supplying");
            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => {
                        return (s.structureType == STRUCTURE_SPAWN || 
                            s.structureType == STRUCTURE_TOWER ||
                            s.structureType == STRUCTURE_EXTENSION) && s.energy < s.energyCapacity
                    }
            });
            if(target) {
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                } 
                return;
            }
            target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => {
                        return (s.structureType == STRUCTURE_STORAGE) 
                            && s.store[RESOURCE_ENERGY] < s.storeCapacity
                    }
            });
            if(!target) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => {
                        return (s.structureType == STRUCTURE_CONTAINER) 
                            && s.store[RESOURCE_ENERGY] < s.storeCapacity
                    }
                });
            }
            if(target) {
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                } 
            } else {
                creep.moveTo(spawn1);//Game.flags['outOfTheWay']);
            }
        } else { 
            creep.say("gathering");
            var t = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 30, {
                    filter: (r) => r.resourceType == RESOURCE_ENERGY});
            if(t.length > 0) {
                creep.pickup(t[0])
                creep.moveTo(t[0]);
                return;
            }
            var source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => ((s.structureType == STRUCTURE_CONTAINER) 
                    && s.store[RESOURCE_ENERGY] > 0)});   
            if(!source) {
                source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => ((s.structureType == STRUCTURE_STORAGE) 
                    && s.store[RESOURCE_ENERGY] > 0)});
            }
            if(source) {
                if(creep.withdraw(source, RESOURCE_ENERGY) != OK) {
                    creep.moveTo(source);
                } 
            } else {
                if(creep.carry.energy > 0)
                    creep.memory.working = true;
                else
                    creep.moveTo(spawn1);
            }
        }
    },
    base: [CARRY,MOVE],
    add: {
        0: { type: MOVE, amt: 24},
        1: { type: CARRY, amt: 24}
    }
}

module.exports = courier;