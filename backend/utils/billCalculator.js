const calculateBill = (totalLiters) => {
    let slabBreakdown = [];
    let remainingLiters = totalLiters;
    let totalCost = 0;

    // Slab 1: 0-500L at ₹2
    if (remainingLiters > 0) {
        const slab1Liters = Math.min(500, remainingLiters);
        const slab1Cost = slab1Liters * 2;
        slabBreakdown.push({ range: '0-500L', rate: 2, liters: slab1Liters, cost: slab1Cost });
        remainingLiters -= slab1Liters;
        totalCost += slab1Cost;
    }

    // Slab 2: 500-1000L at ₹3
    if (remainingLiters > 0) {
        const slab2Liters = Math.min(500, remainingLiters);
        const slab2Cost = slab2Liters * 3;
        slabBreakdown.push({ range: '500-1000L', rate: 3, liters: slab2Liters, cost: slab2Cost });
        remainingLiters -= slab2Liters;
        totalCost += slab2Cost;
    }

    // Slab 3: 1000L+ at ₹5
    if (remainingLiters > 0) {
        const slab3Cost = remainingLiters * 5;
        slabBreakdown.push({ range: '1000L+', rate: 5, liters: remainingLiters, cost: slab3Cost });
        totalCost += slab3Cost;
    }

    return { totalCost, slabBreakdown };
};

module.exports = calculateBill;
