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
        }
    }
    let repairs = spawn1.room.find(FIND_STRUCTURES, {
        filter: (s) => ((
            (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) && s.hits < 1000) || 
            ((s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART && 
                s.structureType != STRUCTURE_ROAD) && s.hits < 0.9 * s.hitsMax) ||
            (s.structureType == STRUCTURE_ROAD && s.hits < s.hitsMax * 0.75 &&
                Memory.roomData[spawn1.room.name].travelData[JSON.stringify({x:s.pos.x,y:s.pos.y})] > 20))
    });
    if(repairs.length && towers.length) {
        for(let target in repairs) {
            let ts = repairs[target].pos.findInRange(towers, 18, {
                filter: (t) => (t.energy > 10)
            });
            for(let tower of ts) {
                tower.repair(target);
                // continue;
            }
        }
    }
};
taskTowers.name = "towers";