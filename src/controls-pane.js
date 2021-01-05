import assess from './conditions';

function arrayEquals(arr1, arr2) {
    if (arr1.length !== arr2.length)
        return false;

    for (let i = 0; i < arr1.length; i++)
        if (arr1[i] !== arr2[i])
            return false;

    return true;
}

export default function ControlsPane({ variables, values, onChange }) {
    return variables
        .filter(({ definition }) => {
            if (assess(definition.condition, values))
                return true;

            const target = [definition.default || []].flat();

            if (!arrayEquals(values[definition.placeholder], target))
                onChange(definition.placeholder, target);

            return false;
        })
        .map(({ definition, handler }) => handler.render(definition, values[definition.placeholder], x => onChange(definition.placeholder, x)))
}