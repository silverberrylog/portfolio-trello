interface InputObject {
    name: string
    createdAt: number
    [key: string]: any
}

export const sortArr = (
    inputArr: InputObject[],
    field: 'name' | 'createdAt',
    order: 'asc' | 'desc'
) => {
    const inputCopy = [...inputArr]

    if (field == 'name') {
        const orderByStrFieldAsc = (a: InputObject, b: InputObject) => {
            return a[field].localeCompare(b[field], 'en', {
                sensitivity: 'base',
            })
        }

        const orderByStrFieldDesc = (a: InputObject, b: InputObject) => {
            return b[field].localeCompare(a[field], 'en', {
                sensitivity: 'base',
            })
        }

        return order == 'asc'
            ? inputCopy.sort(orderByStrFieldAsc)
            : inputCopy.sort(orderByStrFieldDesc)
    }

    return order == 'asc'
        ? inputCopy.sort((a, b) => a[field] - b[field])
        : inputCopy.sort((a, b) => b[field] - a[field])
}
