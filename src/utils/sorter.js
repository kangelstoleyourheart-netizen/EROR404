export function filterProducts(list, query, sortBy) {
    if (!list) return [];
    let results = list.filter(item => 
        (item.title && item.title.toLowerCase().includes(query)) ||
        (item.shortDesc && item.shortDesc.toLowerCase().includes(query))
    );

    if (sortBy === 'price_asc') return results.sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') return results.sort((a, b) => b.price - a.price);
    
    return results;
}

export function filterNews(list, query, sortBy) {
    if (!list) return [];
    let results = list.filter(item => 
        (item.title && item.title.toLowerCase().includes(query)) ||
        (item.shortDesc && item.shortDesc.toLowerCase().includes(query))
    );

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()); 

    if (sortBy === 'new_first') {
        return results.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    if (sortBy === 'today') {
        return results.filter(item => new Date(item.date) >= todayStart);
    }
    if (sortBy === 'week') {
        const lastWeek = new Date(todayStart);
        lastWeek.setDate(todayStart.getDate() - 7);
        return results.filter(item => new Date(item.date) >= lastWeek);
    }
    if (sortBy === 'month') {
        const lastMonth = new Date(todayStart);
        lastMonth.setMonth(todayStart.getMonth() - 1);
        return results.filter(item => new Date(item.date) >= lastMonth);
    }

    return results;
}