function andSeparatedList(values){
    switch (values.length) {
        case 0: return '';
        case 1: return values[0];
        default:
            const last = values.pop();
            return values.join(', ') + ' and ' + last;
    }
}

export default function render(renderer, values){
    switch(renderer){
        default: return andSeparatedList(values);
    }
}