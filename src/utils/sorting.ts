// // import { List } from '@/types'

// interface ObjWithCreatedAt {
//     createdAt: number
//     [key: string]: any
// }
// export const sortByCreatedAt = (
//     arr: ObjWithCreatedAt[],
//     order: 'asc' | 'desc'
// ) => {
//     // if (order == 'asc') return arr.sort((a, b) => a[key] - b[key])
//     // return arr.sort((a, b) => b[key] - a[key])
//     console.log(arr)
//     return order == 'asc'
//         ? arr.sort((a, b) => a.createdAt - b.createdAt)
//         : arr.sort((a, b) => b.createdAt - a.createdAt)
// }

export const sortBy = (
    arr: List[],
    key: string,
    order: 'asc' | 'desc'
): List[] => {
    return arr
}
