var miner =  {
    run: function(creep) {
        var spawn1 = Game.rooms[creep.memory.home].find(FIND_MY_SPAWNS)[0];

        var sum = 0;
        Object.keys(creep.carry).forEach(function(r) {
            sum += creep.carry[r];
        });

        if(!creep.memory.working && sum == creep.carryCapacity) {
            creep.memory.working = true;
        }
        if(creep.memory.working && sum == 0) {
            creep.memory.working = false;
        }

        if(!creep.memory.working) {
            creep.say("mining");
            var source = creep.pos.findClosestByPath(FIND_MINERALS);
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                if(creep.moveTo(source,{visualizePathStyle: {stroke: '#ffaa00'}}) == ERR_NO_PATH) {
                }
            }
        } else { //depositing minerals
            creep.say("depositing");
            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => (s.structureType == STRUCTURE_TERMINAL)});
            if(target) {
                Object.keys(creep.carry).forEach(function(r) {
                    if(creep.transfer(target, r) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                });
            }
        }
    },
    base: [WORK,CARRY,MOVE],
    add: {
        0: { type: WORK, amt: 5},
        1: { type: WORK, amt: 5},
        2: { type: CARRY, amt: 3},
        3: { type: MOVE, amt: 4}
    }
}

module.exports = miner;