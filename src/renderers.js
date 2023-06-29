function andSeparatedList(values){
    switch (values.length) {
        case 0: return '';
        case 1: if (values[0] === "." || values[0] === "down_list" || values[0] === "colon") {
            return '';
        } else {
            return values[0];
        };
        default:
            const last = values.pop();

            if(values[0] !== "" && values[0] !== undefined) {
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
                    if (last === "colon") {
                        const lastdot = values.pop();
                        if(values.length === 0){
                            return `${lastdot}: `
                        } else {
                        return `${values.join(', ')} and ${lastdot}: `
                        }                
                    } else {
                    return `${values.join(', ')} and ${last}`
                    }
                }
            }
        } else {
            return ''
        }
    }
}

export default function render(renderer, values){
    switch(renderer){
        default: return andSeparatedList(values);
    }
}