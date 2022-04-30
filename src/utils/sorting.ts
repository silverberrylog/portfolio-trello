export const sortBy = (arr: Object[], key: string, order: 'asc' | 'desc') => {
    if (order == 'asc') return arr.sort((a, b) => a[key] - b[key])
    return arr.sort((a, b) => b[key] - a[key])
}
