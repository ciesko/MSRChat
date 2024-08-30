import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

export const ImportProfileDialogStyles = makeStyles({
    dialog: {
        maxWidth: '600px',
        minHeight: '400px'
    },
    dialogContent: {
        // Display flex column at start but space between vertical
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        width: '100%',
        padding: tokens.spacingVerticalL,
        ...shorthands.gap(tokens.spacingVerticalL),
    },
    titleImage: {
        // fit image inside the dialog
        borderRadius: `${tokens.borderRadiusLarge}`,
    },
    profileImage: {
        width: '96px',
        height: '96px',
    },
    centeredContent: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        ...shorthands.gap(tokens.spacingHorizontalL),
        marginTop: tokens.spacingVerticalL,
        marginBottom: tokens.spacingVerticalL,
    },
    importCommandRow: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: tokens.spacingVerticalL,
        marginBottom: tokens.spacingVerticalL,
    },
    fileUploadRow: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'start',
        alignItems: 'center',
        marginTop: tokens.spacingVerticalL,
        marginBottom: tokens.spacingVerticalL,
        ...shorthands.gap('5px'),
    },
    dialogActions: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    fileInput: {
        display: 'none',
    },
    
});
