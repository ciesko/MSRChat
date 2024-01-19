import { makeStyles, shorthands } from "@fluentui/react-components";

export const ChatHistoryStyles = makeStyles({
    panelHeader: {
        // Display cards in row and equal space between
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',

    },
    container: {
        maxHeight: 'calc(100vh - 100px)',
        width: '300px',
    },
    listContainer: {
        ...shorthands.overflow('hidden', 'auto'),
        maxHeight: 'calc(90vh - 105px)',
    },
    itemCell: {
        maxWidth: '270px',
        minHeight: '32px',
        cursor: 'pointer',
        paddingLeft: '15px',
        paddingRight: '5px',
        paddingTop: '5px',
        paddingBottom: '5px',
        boxSizing: 'border-box',
        ...shorthands.borderRadius('5px'),
        display: 'flex',
    },
    chatGroup: {
        ...shorthands.margin('auto 5px'),
        width: '100%',
    },
    spinnerContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50px',
    },
    chatList: {
        width: '100%',
    },
    chatMonth: {
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '5px',
        paddingLeft: '15px',
    },
    chatTitle: {
        width: '80%',
        ...shorthands.overflow('hidden'),
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    historyItem: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...shorthands.gap('5px'),
    },
    historyItemEditButtons: {
        display: 'flex',
        flexDirection: 'row',
        marginTop: '5px',
        ...shorthands.gap('5px'),
    },
    drawerBody: {   
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
        flexWrap: 'wrap',
        ...shorthands.padding('1px')
    },

});