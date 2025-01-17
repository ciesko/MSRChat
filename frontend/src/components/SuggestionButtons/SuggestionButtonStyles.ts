import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

export const SuggestionButtonStyles = makeStyles({
    container: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...shorthands.gap('5px'),
        '@media (max-width: 400px)': {
            marginTop: '10px',
            ...shorthands.gap('2px'),
        },
    },

    questionsContainerHorizontal: {
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        ...shorthands.gap('15px'),
    },

    questionsContainerVertical: {
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        ...shorthands.gap('5px'),
    },

    prompt: {
        marginTop: '20px',
        marginBottom: '20px',
        fontSize: '16px',
        lineHeight: '22px',
        fontWeight: '600',
        color: tokens.colorNeutralForeground1,
        '@media (max-width: 400px)': {
            fontSize: '14px',
            lineHeight: '16px',
            fontWeight: '600',
        },
    },

    button: {
        width: '250px',
        height: '120px',
        fontSize: '14px',
        backgroundColor: tokens.colorNeutralBackground4,
    },
});