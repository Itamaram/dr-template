function andSeparatedList(values){
    switch (values.length) {
        case 0: return '';
        case 1: if (values[0] === "." | values[0] === "down_list") {
            return '';
        } else {
            return values[0];
        };
        default:
            const last = values.pop();
            if (last === "down_list") {
                return `<br>- ${values.join('<br>- ')}`;
            } else {
            if (last === ".") {
                const lastdot = values.pop();
                if(values.length === 0){
                    return `${lastdot}.`
                } else {
                return `${values.join(', ')} and ${lastdot}.`
                }                
            } else {
            return `${values.join(', ')} and ${last}`
            }
        }
    }
}

export default function render(renderer, values){
    switch(renderer){
        default: return andSeparatedList(values);
    }
}