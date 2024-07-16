import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

export const PostUserDataStyles = makeStyles({
    container: {
        width: '100%',
    },
    formContainer: {
        display: 'flex',
        flexDirection: 'column',
        ...shorthands.gap('10px'),
    },
    tagContainer: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        ...shorthands.gap('s1')
    },
    tag: {
        ...shorthands.margin('5px'),
        // text overflow hidden elipsis
        whiteSpace: 'nowrap',
        ...shorthands.overflow('hidden'),
        textOverflow: 'ellipsis',
        display: 'flex',
        flexDirection: 'row',
        verticalAlign: 'middle',
    },
    tagText: {
        ...shorthands.margin('0px 5px'),
        whiteSpace: 'nowrap',
        ...shorthands.overflow('hidden'),
        textOverflow: 'ellipsis',
    },
    successContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...shorthands.gap('10px'),
        ...shorthands.margin('10px'),
    },
    successText: {
        // center text
        textAlign: 'center',
    },
});