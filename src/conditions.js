export default function assess(condition, values) {
    if (!condition)
        return true;
    if (condition.and)
        return condition.and.every(c => assess(condition, values));
    if (condition.or)
        return condition.or.some(c => assess(c, values));
    if (condition.equals)
        return values[condition.field] === condition.equals;
    if (condition['not-equals'])
        return values[condition.field] !== condition['not-equals'];
    return false;
}