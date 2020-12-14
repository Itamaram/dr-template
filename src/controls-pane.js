import assess from './conditions';

export default function ControlsPane({ variables, values, onChange }) {
    return variables
        .filter(v => assess(v.definition.condition, values))
        .map(({ definition, handler }) => handler.render(definition, values[definition.placeholder], x => onChange(definition.placeholder, x)))
}