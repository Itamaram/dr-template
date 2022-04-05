import React from 'react'

export const handler = {
    type: 'title',
    render: function({ text, style }) {
        switch(style){
            case "normal": return (<span>{text}</span>);
            case "bold": return (<b>{text}</b>);
            case "small": return (<h4>{text}</h4>);
            case "medium": return (<h3>{text}</h3>);
            case "large": return (<h2>{text}</h2>)
            default: return (<h2>{text}</h2>)
        }
    }
}