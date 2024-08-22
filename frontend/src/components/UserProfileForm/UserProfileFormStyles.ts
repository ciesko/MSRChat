import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

export const UserProfileFormStyles = makeStyles({
    container: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        ...shorthands.gap('10px'),
    },
    textAreaField: {
        width: '100%',
    },
    footerRow: {
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
        ...shorthands.gap('10px'),
    },

});