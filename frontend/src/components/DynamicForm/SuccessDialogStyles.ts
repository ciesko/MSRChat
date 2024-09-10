import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

export const SuccessDialogStyles = makeStyles({
    body: {
        // center content in column and add padding
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
    },
    icon: {
        // set icon size
        fontSize: '124px',
        color: tokens.colorPaletteGreenForeground1,
    },
    messageTitle: {
        color: tokens.colorPaletteGreenForeground1,
    },

});