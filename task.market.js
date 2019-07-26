let taskMarket = module.exports;
taskMarket.run = function(spawns) {
    let spawn1 = spawns[0];
    let terminal = spawn1.room.terminal;
    if(terminal && Game.time % 20 == 0) {
        let amtToSell = 200;
        let maxEnergyCost = 800;
        let reserveAmt = 5200;
        let minimumPrice = 0.7;
        for(let rss in terminal.store) {
            if(rss == RESOURCE_ENERGY) continue;
            if(terminal.store[RESOURCE_ENERGY] > maxEnergyCost && terminal.store[rss] > reserveAmt) {
                // console.log("Room: " + spawn1.room.name + ": checking market for " + rss);
                let orders = Game.market.getAllOrders(
                    (order) => (order.resourceType == rss &&
                                order.type == ORDER_BUY &&
                                Game.market.calcTransactionCost(amtToSell, spawn1.room.name, order.roomName) < maxEnergyCost))
                        .sort(function(a,b) { return b.price - a.price; }
                );
                if(orders.length > 0 && orders[0].price > minimumPrice) {
                    if(Game.market.deal(orders[0].id, amtToSell, spawn1.room.name) == OK) {
                        Game.notify("Room: " + spawn1.room.name + ": Order to sell 200 of " + rss + " completed for " + orders[0].price * amtToSell + " credits (" + orders[0].price + "/ea).");
                        break;
                    }
                }
            }
        }
    }
}