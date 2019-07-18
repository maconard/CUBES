var taskTowers = {
    run: function(spawns) {
        var spawn1 = spawns[0];
        var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER && s.room == spawn1.room);
        for(var tower of towers) {
            if(tower.energy >= 10) {
                var target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if(target) {
                    tower.attack(target);
                    return;
                }
                target = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
                    filter: (c) => (c.hits < c.hitsMax)});
                if(target) {
                    tower.heal(target);
                    return;
                }
                target = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (s) => ((s.structureType == STRUCTURE_WALL || 
                                    s.structureType == STRUCTURE_RAMPART) && s.hits < 1000) || 
                                    ((s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART 
                                        && s.structureType != STRUCTURE_ROAD) 
                                    && s.hits < s.hitsMax) ||
                                    (s.structureType == STRUCTURE_ROAD 
                                        && Memory.roomData[tower.room.name].travelData[JSON.stringify({x:s.pos.x,y:s.pos.y})] > 30)
                });
                if(target) {
                    tower.repair(target);
                    return;
                }
            }
        }
    }
}

module.exports = taskTowers;