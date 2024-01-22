import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

export const ChatStyles = makeStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '20px',
        paddingLeft: '20px',
        paddingRight: '20px',
        boxSizing: 'border-box',
    },

    chatContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        //background: 'radial-gradient(108.78% 108.78% at 50.02% 19.78%, #FFFFFF 57.29%, #EEF6FE 100%)',
        boxShadow: tokens.shadow4,
        ...shorthands.borderRadius(tokens.borderRadiusXLarge),
        overflowY: 'auto',
        height: 'calc(100vh - 130px)',
        ...shorthands.padding('30px'),
        boxSizing: 'border-box',
    },

    questionDisplayRow: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },

    chatEmptyState: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },

    chatMessageErrorContent: {
        ...shorthands.gap('12px'),
        alignItems: "center",
        display: "flex",
    },

    chatInput: {
        display: 'flex',
        width: '100%',
        maxWidth: '1080px',
        flexDirection: 'row',
    },

    chatButtonsLeftContainer: {
        // Display vertically and equal space between
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        ...shorthands.gap('10px'),
        ...shorthands.margin('8px'),
    },

    citationPanelHeaderContainer: {
        width: '100%',
        // display horizontally and equal space between
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    stopGeneratingContainer: {
        ...shorthands.margin('8px'),
    },

    chatMessageStream: {
        // display vertically and 10px gap
        display: 'flex',
        flexDirection: 'column',
        ...shorthands.gap('10px'),
        width: '100%',
        maxWidth: '1080px',
        maxHeight: '70%',
        overflowY: 'auto',
        ...shorthands.padding('10px'),
        boxSizing: 'border-box',
    },

    chatInputContainer: {
        // display vertically and centered  
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '1080px',
        height: '165px',
        marginTop: '15px',
    },

    chatMessageError: {
        ...shorthands.padding('20px'),
        ...shorthands.borderRadius(tokens.borderRadiusLarge),
        ...shorthands.flex('none'),
        order: 0,
        flexGrow: 0,
        maxWidth: '800px',
        marginBottom: '12px',
    },   

});
