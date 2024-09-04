import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

export const DynamicFormStyles = makeStyles({
    container: {
        width: '100%',
        overflowY: 'auto',
        height: 'calc(100vh - 90px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        ...shorthands.gap(tokens.spacingVerticalM),
    },
    footerActionRow: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',        alignSelf: 'flex-end',
        ...shorthands.gap(tokens.spacingHorizontalM),
    },
    validationMessage: {
        width: '100%',
        color: tokens.colorPaletteRedForeground1,
    },
    titleRow: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: '10px',
    },
});