export default function assess(condition, values) {
    if (!condition || Object.keys(condition).length === 0)
        return true;
    if (condition.and)
        return condition.and.every(c => assess(c, values));
    if (condition.or)
        return condition.or.some(c => assess(c, values));
    if (condition.equals)
        return !!condition.equals.length
            ? values[condition.field]?.map(({value}) => value).includes(condition.equals)
            : !values[condition.field].length
    if (condition['not-equals'])
        return !!condition['not-equals'].length
            ? !values[condition.field]?.map(({value}) => value).includes(condition['not-equals'])
            : values[condition.field][0]?.value === ''?!!values[condition.field][0]?.value.length
            :!!values[condition.field].length;
    if (condition.contains)
        return !!condition.contains.length
            ? values[condition.field]?.map(({value}) => value.toLowerCase().includes(condition.contains.toLowerCase())).some(function(v) { return v === true;})
            : !values[condition.field].length;
    if (condition['not-contains'])
        return !!condition['not-contains'].length
            ? !values[condition.field]?.map(({value}) => value.toLowerCase().includes(condition['not-contains'].toLowerCase())).some(function(v) { return v === true;})
            : !!values[condition.field].length    ;        
    return false;
}