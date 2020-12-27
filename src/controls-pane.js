import assess from './conditions';

export default function ControlsPane({ variables, values, onChange }) {
    return variables
        .filter(({ definition, handler }) => {
            if (assess(definition.condition, values))
                return true;
            if (values[definition.placeholder] !== handler.seed)
                onChange(definition.placeholder, handler.seed)
            return false;
        })
        .map(({ definition, handler }) => handler.render(definition, values[definition.placeholder], x => onChange(definition.placeholder, x)))
}