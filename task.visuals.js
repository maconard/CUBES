let taskVisuals = module.exports;
taskVisuals.run = function(spawns) {
    let s = spawns[0];
    if(!Memory.visuals) return;
    if(!Memory.roomData[s.room.name]) Memory.roomData[s.room.name] = { travelData: {} };
    let travel = Memory.roomData[s.room.name].travelData;
    for(let t in travel) {
        let dt = JSON.parse(t);
        if(travel[t] > 35)
            s.room.visual.rect(dt.x - 0.5, dt.y - 0.5, 1, 1, { fill: "#ff0000", opacity: .3 }); //red, lots of travel
        else if(travel[t] > 15)
            s.room.visual.rect(dt.x - 0.5, dt.y - 0.5, 1, 1, { fill: "#ff00ff", opacity: .3 }); //magenta, mild travel
        else if(travel[t] > 0)
            s.room.visual.rect(dt.x - 0.5, dt.y - 0.5, 1, 1, { fill: "#0000ff", opacity: .3 }); //blue, low travel 
    }
};
taskVisuals.global = function() {
    // if(!Memory.visuals) return;
    for(let i = 0; i < global.displays.length; i++) {
        new RoomVisual().text(global.displays[i],0.5,i+0.5, {align: "left"});
    }
};