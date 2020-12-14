import render from './renderers';

export default function process(pattern, variables, values) {
    return pattern.replace(/{(?:([^:}]+?):)?([^}]+)}/g, (x, renderer, keys) => {
        const vs = keys.split(',').map(s => s.trim()).filter(s => s !== '')
            .map(s => s.split('|'))
            .map(([key, modifier]) => {
                const variable = variables.filter(({ definition }) => definition.placeholder === key)[0]
                if (variable)
                    return variable.handler.getValues(variable.definition, values[key], modifier);
                return [];
            })
            .flatMap(x => x);
        return render(renderer, vs);
    }).replace(/  +/g, ' ').trim();
}