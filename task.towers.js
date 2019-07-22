let taskTowers = module.exports;
taskTowers.run = function(spawns) {
    let spawn1 = spawns[0];
    let towers = _.filter(Game.structures, (s) => (s.structureType == STRUCTURE_TOWER && s.room.name == spawn1.room.name));
    for(let tower of towers) {
        if(tower.energy >= 10) {
            let target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if(target) {
                tower.attack(target);
                continue;
            }
            target = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
                filter: (c) => (c.hits < c.hitsMax)});
            if(target) {
                tower.heal(target);
                continue;
            }
            target = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (s) => (
                    (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) && s.hits < 1000) || 
                    ((s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART && 
                        s.structureType != STRUCTURE_ROAD) && s.hits < s.hitsMax) ||
                    (s.structureType == STRUCTURE_ROAD && 
                        Memory.roomData[tower.room.name].travelData[JSON.stringify({x:s.pos.x,y:s.pos.y})] > 20)
            });
            if(target) {
                tower.repair(target);
                continue;
            }
        }
    }
};