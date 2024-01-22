import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

export const AnswerStyles = makeStyles({
    card: {
        backgroundColor: tokens.colorBrandBackground2,
    },
    answerText: {
        ...shorthands.flex('none'),
        order: 1,
        alignSelf: 'stretch',
        flexGrow: 0,
        whiteSpace: 'normal',
        wordWrap: 'break-word',
        maxWidth: '800px',
        overflowX: 'auto',
    },
    answerFooter: {
        display: 'flex',
        // flexFlow: 'row nowrap',
        width: '100%',
        height: 'auto',
        boxSizing: 'border-box',
        justifyContent: 'space-between',
    },
    answerDisclaimerContainer: {
        justifyContent: 'center',
        display: 'flex',
    },
    answerDisclaimer: {
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center',
        ...shorthands.flex('none'),
        order: 1,
        flexGrow: 0,
    },
    accordionTitle: {
        marginRight: '5px',
        marginLeft: '10px',
        fontStyle: 'normal',
        lineHeight: '16px',
        display: 'flex',
        alignItems: 'center',
        '&:hover': {
            cursor: 'pointer',
        },
    },
    citationHeader: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        ...shorthands.gap('5px'),
    },
    citationListContainer: {
        marginTop: '8px', 
        display: "flex", 
        flexDirection: "column",
        ...shorthands.gap("4px"),
    },
    citationCardContent: {
        display: 'flex',
        flexDirection: 'row',
    },
});
