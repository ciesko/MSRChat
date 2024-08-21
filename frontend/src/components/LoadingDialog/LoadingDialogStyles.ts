import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

export const LoadingDialogStyles = makeStyles({
    titleRow: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        ...shorthands.gap(tokens.spacingHorizontalM),
    },
});