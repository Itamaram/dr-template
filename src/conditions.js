export default function assess(condition, values) {
    if (!condition)
        return true;
    if (condition.and)
        return condition.and.every(c => assess(c, values));
    if (condition.or)
        return condition.or.some(c => assess(c, values));
    if (condition.equals)
        return !!condition.equals.length
            ? values[condition.field].includes(condition.equals)
            : !values[condition.field].length
    if (condition['not-equals'])
        return !!condition['not-equals'].length
            ? values[condition.field].includes(condition['not-equals'])
            : !!values[condition.field].length;
    return false;
}