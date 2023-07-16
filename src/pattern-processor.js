import render from './renderers';

export default function process(pattern, variables, values) {
    return pattern.replace(/{(?:([^:}]+?):)?([^}]+)}/g, (_, renderer, right) => {
        const vs = right.split(',').map(s => s.trim()).map(s => s.split('|')).flatMap(([keys, modifier]) => 
            keys.split(';').map(s => s.trim()).filter(s => s !== '')
                .map(key => {
                    const variable = variables.filter(({ definition }) => definition.placeholder === key)[0]
                    if (variable) {
                        if (modifier && modifier.includes('~')){
                            const [left, rest] = modifier.split('~');
                            const [right,modifiersecondary] = rest.split(';')
                            const variablesecondary = variables.filter(({ definition }) => definition.placeholder === left)[0];
                            if (variablesecondary && variablesecondary.handler.getValues(variablesecondary.definition, values[left], '').map((str) => str.trim()).includes(right)) {
                                    return variable.handler.getValues(variable.definition, values[key], modifiersecondary);
                            } 
                            if (right.includes('!!') && (typeof variablesecondary === 'undefined' || !variablesecondary.handler.getValues(variablesecondary.definition, values[left], '').map((str) => str.trim()).includes(right.replace('!!', '')))) {
                                return variable.handler.getValues(variable.definition, values[key], modifiersecondary);
                            }
                            return [];
                        }
                        return variable.handler.getValues(variable.definition, values[key], modifier);           
                    }
                    return [];
                })
                .flatMap(x => x)
        );
        return render(renderer, vs);
    }).replace(/  +/g, ' ').trim();
}