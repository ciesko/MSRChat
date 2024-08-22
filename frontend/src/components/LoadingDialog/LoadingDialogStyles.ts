import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

export const LoadingDialogStyles = makeStyles({
    titleRow: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        ...shorthands.gap(tokens.spacingHorizontalM),
    },
    content: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        ...shorthands.gap(tokens.spacingVerticalM),
    },
});