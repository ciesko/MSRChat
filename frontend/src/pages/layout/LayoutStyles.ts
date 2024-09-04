import { makeStyles, shorthands } from "@fluentui/react-components";

export const LayoutStyles = makeStyles({
    page: {
        width: '100%',
    },
    containerEmbed: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box',
        paddingTop: '20px',
        paddingLeft: '20px',
        paddingRight: '20px',
        overflowY: 'hidden',
    },
    coffeeHeader: {
        backgroundColor: 'black',
        color: 'white',
        // center the row
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50px',
        width: '100%',
    },
    homeButton: {
        position: 'absolute',
        top: '10px',
        left: '20px',
        color: 'white',
    },   
});