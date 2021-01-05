import assess from './conditions';

export default function ControlsPane({ variables, values, onChange }) {
    return variables
        .filter(({ definition }) => assess(definition.condition, values))
        .map(({ definition, handler }) => handler.render(definition, values[definition.placeholder], x => onChange(definition.placeholder, x)))
}