const getSuggestions = (categories, numPeople) => {
    const suggestions = [];
    const avgPerPerson = Object.values(categories).reduce((a, b) => a + b, 0) / numPeople;

    if (categories.bathing > 200) {
        suggestions.push({
            category: 'Bathing',
            tip: 'Try shortening your showers by just 2 minutes to save up to 30 liters per person.',
            impact: 'High'
        });
    }

    if (categories.washing > 150) {
        suggestions.push({
            category: 'Washing',
            tip: 'Only run your washing machine with full loads to optimize water and energy use.',
            impact: 'Medium'
        });
    }

    if (categories.gardening > 100) {
        suggestions.push({
            category: 'Gardening',
            tip: 'Water your plants early in the morning or late evening to reduce evaporation.',
            impact: 'Medium'
        });
    }

    if (categories.kitchen > 100) {
        suggestions.push({
            category: 'Kitchen',
            tip: 'Fix any dripping taps immediately. A single leaking tap can waste 5-10 liters a day.',
            impact: 'Low'
        });
    }

    // Default suggestions if usage is low
    if (suggestions.length === 0) {
        suggestions.push({
            category: 'General',
            tip: 'Your usage is excellent! Keep maintaining these water-saving habits.',
            impact: 'None'
        });
    }

    return suggestions;
};

module.exports = getSuggestions;
