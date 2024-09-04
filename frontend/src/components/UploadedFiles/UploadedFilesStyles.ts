import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

export const UploadedFilesStyles = makeStyles({
    container: {
        width: '100%',
    },
    card: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        minHeight: '140px',
        marginBottom: '20px',
        overflowY: 'auto',
        ...shorthands.gap('10px'),
        ...shorthands.overflow('auto'), // Add this line to enable scrolling if content exceeds container height
    },
    fileUploadControl: {
        display: 'none',
    },
    header: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
    },
    fileRow: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'start',
        alignItems: 'center',
        ...shorthands.gap('3px'),
    },
    uploadSeparator: {
        // display a line separator horizontal
        width: '100%',
        height: '1px',
        backgroundColor: tokens.colorNeutralStroke1,
    },
});