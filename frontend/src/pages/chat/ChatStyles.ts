import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

export const ChatStyles = makeStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
    },
    containerWithForm: {
       // display in row and contain all elements in screen size
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        height: '90vh',
        maxWidth: '1080px',
        marginLeft: 'auto',
        marginRight: 'auto',
        '@media (max-width: 600px)': {
            flexDirection: 'column',
        },
        columnGap: '20px',
    },
    chatContainer: {
        minWidth: '600px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: tokens.shadow8,
        ...shorthands.borderRadius(tokens.borderRadiusXLarge),
        overflowY: 'auto',
        overflowX: 'hidden',
        height: 'calc(100vh - 90px)',
        ...shorthands.padding('30px'),
        boxSizing: 'border-box',
        backgroundColor: tokens.colorNeutralBackground4,
        '@media (max-width: 400px)': {
            ...shorthands.padding('15px'),
            height: 'calc(100vh - 130px)',
        },
    },

    chatContainerEmbed: {
        minWidth: '540px',
        width: '50%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowY: 'hidden',
        overflowX: 'hidden',
        '@media (max-width: 400px)': {
            ...shorthands.padding('15px'),
            height: 'calc(100vh - 130px)',
        },
    },

    title: {
        paddingTop: '15px',
        fontSize: '24px',
        lineHeight: '32px',
        fontWeight: '600',
        '@media (max-width: 400px)': {
            fontSize: '18px',
            lineHeight: '24px',
            fontWeight: '600',
        },
    },

    subtitle: {
        fontSize: '16px',
        lineHeight: '22px',
        fontWeight: '600',
        '@media (max-width: 400px)': {
            fontSize: '14px',
            lineHeight: '18px',
            fontWeight: '600',
        },
    },

    questionDisplayRow: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingRight: '10px',
    },

    chatEmptyState: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: '900px',
        ...shorthands.gap('10px'),
        width: '100%',
        textAlign: 'center',
        marginLeft: 'auto',
        marginRight: 'auto',
        '@media (max-width: 400px)': {
            ...shorthands.gap('0px'),
        }
    },

    chatMessageErrorContent: {
        ...shorthands.gap('12px'),
        alignItems: "center",
        display: "flex",
    },

    chatInput: {
        display: 'flex',
        width: '100%',
        flexDirection: 'row',
        // this should show at the bottom of the component
        justifyContent: 'center',
        alignItems: 'center',
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
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        minHeight: '25px',
        marginTop: '5px',
        marginBottom: '5px',
    },

    chatMessageStream: {
        // display vertically and 10px gap
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        overflowY: 'auto',
        boxSizing: 'border-box',
        height: '100%',
        ...shorthands.gap('10px'),
        },
        chatInputContainer: {
        // display vertically and centered  
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '1080px'
    },
    bottomSection: {
        // display vertically and centered  
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
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
