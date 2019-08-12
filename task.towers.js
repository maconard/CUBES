let taskTowers = module.exports;
taskTowers.run = function(spawns) {
    let spawn1 = spawns[0];
    let towers = _.filter(Game.structures, (s) => (s.structureType == STRUCTURE_TOWER && s.room.name == spawn1.room.name));
    let mult = 1.0;
    if(Memory.roomData[spawn1.room.name].power) {
        mult = 0.55;
    }
    let repairTargets = spawn1.room.find(FIND_STRUCTURES, {
        filter: (s) => ((
            (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) && s.hits < 1000) || 
            ((s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART && 
                s.structureType != STRUCTURE_ROAD) && s.hits < 0.9 * s.hitsMax) ||
            (s.structureType == STRUCTURE_ROAD && s.hits < s.hitsMax * 0.75 &&
                Memory.roomData[spawn1.room.name].travelData[JSON.stringify({x:s.pos.x,y:s.pos.y})] > 20))
    });
    let hostileTargets = spawn1.room.find(FIND_HOSTILE_CREEPS);
    let healTargets = spawn1.room.find(FIND_MY_CREEPS, {
        filter: (c) => (c.hits < mult * c.hitsMax)});
    for(let tower of towers) {
        if(tower.energy >= 10) {
            let target = tower.pos.findClosestByRange(hostileTargets);
            if(target) {
                tower.attack(target);
                continue;
            }
            target = tower.pos.findClosestByRange(healTargets);
            if(target) {
                tower.heal(target);
                continue;
            }
            target = tower.pos.findClosestByRange(repairTargets);
            if(target) {
                tower.repair(target);
                continue;
            }
        }
    }
};
taskTowers.name = "towers";