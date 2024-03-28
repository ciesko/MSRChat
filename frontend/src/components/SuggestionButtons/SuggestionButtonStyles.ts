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

    questionsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        ...shorthands.gap('15px'),
    },

    prompt: {
        marginTop: '20px',
        marginBottom: '15px',
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
        width: '240px',
        minHeight: '100px',
        backgroundColor: tokens.colorNeutralBackground5,
    },
});