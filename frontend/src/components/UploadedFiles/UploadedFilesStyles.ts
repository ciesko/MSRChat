import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

export const UploadedFilesStyles = makeStyles({
    container: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        minHeight: '140px',
        ...shorthands.gap('10px'),
        ...shorthands.margin('10px'),
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
});