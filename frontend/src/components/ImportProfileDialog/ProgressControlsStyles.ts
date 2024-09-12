import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

export const ProgressControlsStyles = makeStyles({
    container: {
        width: '100%',
        // Display row and space between
        display: 'flex',
        justifyContent: 'space-between',
    },
    progressRow: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        ...shorthands.gap('8px', 'row'),
        
    },
    progress: {
        height: '8px',
        width: '8px',
        borderRadius: tokens.borderRadiusCircular,
        opacity: 0.3,
        backgroundColor: tokens.colorCompoundBrandBackground
    },
    skipPlaceholder: {
        width: '134px',
    }

});