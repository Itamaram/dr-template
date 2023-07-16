import React from 'react'

export const handler = {
    type: 'title',
    render: function({ text, style }, empty , empty_2, values) {

        if (text.includes('^')) {

            const substrings = text.split("^");

            if (text.includes('Other^')) {

                if (values[substrings[0]]?.length > 0 ){
                    for (let i = 0; i < values[substrings[0]]?.length; i++) {
                        if (values[substrings[0]]?.[i].value === `Other^${substrings[2]}`) {
                            text = values[substrings[0]]?.length > 0 ? substrings[3].replace("copy1",values[substrings[0]]?.[i]?.label):text
                        break; // Exit the loop once the matching object is found
                        } 
                    }
                }
            } else {
                if (values[substrings[0]].length === 0) {
                    text = '';
                  } else {
                    const arrayCopy = [...values[substrings[0]]]; // Create a copy of the array
                    const last = arrayCopy.pop(); // Remove the last element from the copied array
                    
                    if (arrayCopy.length === 0) {
                      text = substrings[1].replace("copy1",`${last.label}`);
                    } else {
                      text = substrings[1].replace("copy1",`${arrayCopy.map(value => value.label).join(', ')} and ${last.label}`)
                    }
                  }                  
                        
            }
        }
        
        switch(style){
            case "normal": return (<span>{text}</span>);
            case "bold": return (<b>{text}</b>);
            case "underline": return (<u>{text}</u>)
            case "small": return (<h4>{text}</h4>);
            case "medium": return (<h3>{text}</h3>);
            case "large": return (<h2>{text}</h2>)
            default: return (<h2>{text}</h2>)
        }
    }
}