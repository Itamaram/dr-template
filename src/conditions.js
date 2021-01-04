export default function assess(condition, values) {
    if (!condition)
        return true;
    if (condition.and)
        return condition.and.every(c => assess(c, values));
    if (condition.or)
        return condition.or.some(c => assess(c, values));
    if (condition.includes)
        return values[condition.field].includes(condition.includes)
    if (condition.excludes)
        return !values[condition.field].includes(condition.includes)
    if (condition.equals)
        return values[condition.field] === condition.equals;
    if (condition['not-equals'])
        return values[condition.field] !== condition['not-equals'];
    return false;
}