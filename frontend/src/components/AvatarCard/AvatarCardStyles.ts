import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

export const AvatarCardStyles = makeStyles({
    card: {
        maxWidth: '274px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: tokens.spacingVerticalM,
        ...shorthands.gap(tokens.spacingVerticalM),
    },
});