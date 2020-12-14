export default function assess(condition, values) {
    if (!condition)
        return true;
    if (condition.equals)
        return values[condition.field] === condition.equals;
    if (condition['not-equals'])
        return values[condition.field] !== condition['not-equals'];
    return false;
}