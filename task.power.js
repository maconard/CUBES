let taskPower = module.exports;
taskPower.run = function(spawns) {
    let spawn1 = spawns[0];
    let r = spawn1.room;
    let powerBanks = r.find(FIND_STRUCTURES, {
        filter: (s) => (s.structureType == STRUCTURE_POWER_BANK)
    });
    let powerSpawns = r.find(FIND_STRUCTURES, {
        filter: (s) => (s.structureType == STRUCTURE_POWER_SPAWN)
    });
    if(Game.time % 20 == 0) {
        if(powerBanks.length) {
            console.log("Found power in room: " + r.name);
            Game.notify("Found power in room: " + r.name);
            let powerBank = powerBanks[0];
            Memory.roomData[r.name].power = powerBank.id;
        } else {
            delete Memory.roomData[r.name].power;
        }
    }

    if(powerSpawns.length && powerSpawns[0].power >= 1 && powerSpawns[0].energy >= 50) {
        powerSpawns[0].processPower();
        Game.notify("Room " + r.name + " processed power");
    }
};
taskPower.name = "power";