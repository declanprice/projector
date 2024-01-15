export const isClass = (x: any): boolean => {
    return x.constructor && x.constructor.name
}
