import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

export const UploadedFilesStyles = makeStyles({
    container: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        ...shorthands.gap('10px'),
    },
    fileUploadControl: {
        display: 'none',
    },
    header: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
    },
});