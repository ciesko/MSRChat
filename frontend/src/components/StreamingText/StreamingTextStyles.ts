import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

export const StreamingTextStyles = makeStyles({
    container: {
        width: '100%',
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
});