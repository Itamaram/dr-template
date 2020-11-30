export default function assess(condition, values) {
    return !condition || values[condition.field] === condition.equals
}