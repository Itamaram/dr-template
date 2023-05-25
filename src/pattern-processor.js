import render from './renderers';

export default function process(pattern, variables, values) {
    return pattern.replace(/{(?:([^:}]+?):)?([^}]+)}/g, (_, renderer, right) => {
        const vs = right.split(',').map(s => s.trim()).map(s => s.split('|')).flatMap(([keys, modifier]) => 
            keys.split(';').map(s => s.trim()).filter(s => s !== '')
                .map(key => {
                    const variable = variables.filter(({ definition }) => definition.placeholder === key)[0]
                    if (variable)
                        return variable.handler.getValues(variable.definition, values[key], modifier);
                    return [];
                })
                .flatMap(x => x)
        );
        return render(renderer, vs);
    }).replace(/  +/g, ' ').trim();
}