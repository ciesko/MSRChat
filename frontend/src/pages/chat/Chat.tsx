import { useRef, useState, useEffect, useContext, useLayoutEffect } from "react";
import { ShieldLock48Regular, ErrorCircleRegular, Broom16Regular, Add16Regular, Stop24Regular, Speaker024Regular, SpeakerMuteRegular, Speaker224Regular } from "@fluentui/react-icons";

import uuid from 'react-uuid';
import { isEmpty } from "lodash-es";

import LogoImage from "../../assets/chatIcon.svg";

import {
    ChatMessage,
    ConversationRequest,
    conversationApi,
    Citation,
    ToolMessageContent,
    ChatResponse,
    getUserInfo,
    Conversation,
    historyGenerate,
    historyUpdate,
    historyClear,
    ChatHistoryLoadingState,
    CosmosDBStatus,
    ErrorMessage
} from "../../api";
import { Answer } from "../../components/Answer";
import { QuestionInput } from "../../components/QuestionInput";
import { ChatHistoryPanel } from "../../components/ChatHistory/ChatHistoryPanel";
import { AppStateContext } from "../../state/AppProvider";
import { useBoolean } from "@fluentui/react-hooks";
import { Button, Link, Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions, DialogTrigger, Title1, Subtitle2, Image, Caption1, Subtitle1 } from "@fluentui/react-components";
import { ChatStyles } from "./ChatStyles";
import { QuestionDisplay } from "../../components/QuestionDisplay/QuestionDisplay";
import { CitationDetails } from "../../components/CitationDetails/CitationDetails";
import { SuggestionButtons } from "../../components/SuggestionButtons/SuggestionButtons";

const enum messageStatus {
    NotRunning = "Not Running",
    Processing = "Processing",
    Done = "Done"
}

const Chat = () => {
    const styles = ChatStyles();
    const appStateContext = useContext(AppStateContext)
    const AUTH_ENABLED = appStateContext?.state.frontendSettings?.auth_enabled;
    const SPEECH_ENABLED = appStateContext?.state.frontendSettings?.speech_enabled;
    const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showLoadingMessage, setShowLoadingMessage] = useState<boolean>(false);
    const [activeCitation, setActiveCitation] = useState<Citation>();
    const [isCitationPanelOpen, setIsCitationPanelOpen] = useState<boolean>(false);
    const abortFuncs = useRef([] as AbortController[]);
    const [showAuthMessage, setShowAuthMessage] = useState<boolean>(false);
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [processMessages, setProcessMessages] = useState<messageStatus>(messageStatus.NotRunning);
    const [clearingChat, setClearingChat] = useState<boolean>(false);
    const [hideErrorDialog, { toggle: toggleErrorDialog }] = useBoolean(true);
    const [errorMsg, setErrorMsg] = useState<ErrorMessage | null>()
    const [audioMuted, setAudioMuted] = useState<boolean>(false);

    const [ASSISTANT, TOOL, ERROR] = ["assistant", "tool", "error"]


    // uncomment below for chat history
    // useEffect(() => {
    //     if (appStateContext?.state.isCosmosDBAvailable?.status === CosmosDBStatus.NotWorking && appStateContext.state.chatHistoryLoadingState === ChatHistoryLoadingState.Fail && hideErrorDialog) {
    //         let subtitle = `${appStateContext.state.isCosmosDBAvailable.status}. Please contact the site administrator.`
    //         setErrorMsg({
    //             title: "Chat history is not enabled",
    //             subtitle: subtitle
    //         })
    //         toggleErrorDialog();
    //     }
    // }, [appStateContext?.state.isCosmosDBAvailable]);

    const handleErrorDialogClose = () => {
        toggleErrorDialog()
        setTimeout(() => {
            setErrorMsg(null)
        }, 500);
    }

    useEffect(() => {
        setIsLoading(appStateContext?.state.chatHistoryLoadingState === ChatHistoryLoadingState.Loading)
    }, [appStateContext?.state.chatHistoryLoadingState]);

    const getUserInfoList = async () => {
        const userInfoList = await getUserInfo();
        if (userInfoList.length === 0 && window.location.hostname !== "127.0.0.1") {
            setShowAuthMessage(true);
        }
    }

    let assistantMessage = {} as ChatMessage
    let toolMessage = {} as ChatMessage
    let assistantContent = ""

    const processResultMessage = (resultMessage: ChatMessage, userMessage: ChatMessage, conversationId?: string) => {
        if (resultMessage.role === ASSISTANT) {
            assistantContent += resultMessage.content
            assistantMessage = resultMessage
            assistantMessage.content = assistantContent
        }

        if (resultMessage.role === TOOL) toolMessage = resultMessage

        if (!conversationId) {
            isEmpty(toolMessage) ?
                setMessages([...messages, userMessage, assistantMessage]) :
                setMessages([...messages, userMessage, toolMessage, assistantMessage]);
        } else {
            isEmpty(toolMessage) ?
                setMessages([...messages, assistantMessage]) :
                setMessages([...messages, toolMessage, assistantMessage]);
        }
    }

    const makeApiRequestWithoutCosmosDB = async (question: string, conversationId?: string) => {
        setIsLoading(true);
        setShowLoadingMessage(true);
        const abortController = new AbortController();
        abortFuncs.current.unshift(abortController);

        const userMessage: ChatMessage = {
            id: uuid(),
            role: "user",
            content: question,
            date: new Date().toISOString(),
        };

        let conversation: Conversation | null | undefined;
        if (!conversationId) {
            conversation = {
                id: conversationId ?? uuid(),
                title: question,
                messages: [userMessage],
                date: new Date().toISOString(),
            }
        } else {
            conversation = appStateContext?.state?.currentChat
            if (!conversation) {
                console.error("Conversation not found.");
                setIsLoading(false);
                setShowLoadingMessage(false);
                abortFuncs.current = abortFuncs.current.filter(a => a !== abortController);
                return;
            } else {
                conversation.messages.push(userMessage);
            }
        }

        appStateContext?.dispatch({ type: 'UPDATE_CURRENT_CHAT', payload: conversation });
        setMessages(conversation.messages)

        const request: ConversationRequest = {
            messages: [...conversation.messages.filter((answer) => answer.role !== ERROR)]
        };

        let result = {} as ChatResponse;
        try {
            const response = await conversationApi(request, abortController.signal);
            if (response?.body) {
                const reader = response.body.getReader();
                let runningText = "";

                while (true) {
                    setProcessMessages(messageStatus.Processing)
                    const { done, value } = await reader.read();
                    if (done) break;

                    var text = new TextDecoder("utf-8").decode(value);
                    const objects = text.split("\n");
                    objects.forEach((obj) => {
                        try {
                            runningText += obj;
                            result = JSON.parse(runningText);
                            result.choices[0].messages.forEach((obj) => {
                                obj.id = result.id;
                                obj.date = new Date().toISOString();
                            })
                            setShowLoadingMessage(false);
                            result.choices[0].messages.forEach((resultObj) => {
                                processResultMessage(resultObj, userMessage, conversationId);
                            })
                            runningText = "";
                        }
                        catch { }
                    });
                }
                conversation.messages.push(toolMessage, assistantMessage)
                appStateContext?.dispatch({ type: 'UPDATE_CURRENT_CHAT', payload: conversation });
                setMessages([...messages, toolMessage, assistantMessage]);
            }

        } catch (e) {
            if (!abortController.signal.aborted) {
                let errorMessage = "An error occurred. Please try again. If the problem persists, please contact the site administrator.";
                if (result.error?.message) {
                    errorMessage = result.error.message;
                }
                else if (typeof result.error === "string") {
                    errorMessage = result.error;
                }
                let errorChatMsg: ChatMessage = {
                    id: uuid(),
                    role: ERROR,
                    content: errorMessage,
                    date: new Date().toISOString()
                }
                conversation.messages.push(errorChatMsg);
                appStateContext?.dispatch({ type: 'UPDATE_CURRENT_CHAT', payload: conversation });
                setMessages([...messages, errorChatMsg]);
            } else {
                setMessages([...messages, userMessage])
            }
        } finally {
            setIsLoading(false);
            setShowLoadingMessage(false);
            abortFuncs.current = abortFuncs.current.filter(a => a !== abortController);
            setProcessMessages(messageStatus.Done)
        }

        return abortController.abort();
    };

    const makeApiRequestWithCosmosDB = async (question: string, conversationId?: string) => {
        setIsLoading(true);
        setShowLoadingMessage(true);
        const abortController = new AbortController();
        abortFuncs.current.unshift(abortController);

        const userMessage: ChatMessage = {
            id: uuid(),
            role: "user",
            content: question,
            date: new Date().toISOString(),
        };

        //api call params set here (generate)
        let request: ConversationRequest;
        let conversation;
        if (conversationId) {
            conversation = appStateContext?.state?.chatHistory?.find((conv) => conv.id === conversationId)
            if (!conversation) {
                console.error("Conversation not found.");
                setIsLoading(false);
                setShowLoadingMessage(false);
                abortFuncs.current = abortFuncs.current.filter(a => a !== abortController);
                return;
            } else {
                conversation.messages.push(userMessage);
                request = {
                    messages: [...conversation.messages.filter((answer) => answer.role !== ERROR)]
                };
            }
        } else {
            request = {
                messages: [userMessage].filter((answer) => answer.role !== ERROR)
            };
            setMessages(request.messages)
        }
        let result = {} as ChatResponse;
        try {
            const response = conversationId ? await historyGenerate(request, abortController.signal, conversationId) : await historyGenerate(request, abortController.signal);
            if (!response?.ok) {
                let errorChatMsg: ChatMessage = {
                    id: uuid(),
                    role: ERROR,
                    content: "There was an error generating a response. Chat history can't be saved at this time. If the problem persists, please contact the site administrator.",
                    date: new Date().toISOString()
                }
                let resultConversation;
                if (conversationId) {
                    resultConversation = appStateContext?.state?.chatHistory?.find((conv) => conv.id === conversationId)
                    if (!resultConversation) {
                        console.error("Conversation not found.");
                        setIsLoading(false);
                        setShowLoadingMessage(false);
                        abortFuncs.current = abortFuncs.current.filter(a => a !== abortController);
                        return;
                    }
                    resultConversation.messages.push(errorChatMsg);
                } else {
                    setMessages([...messages, userMessage, errorChatMsg])
                    setIsLoading(false);
                    setShowLoadingMessage(false);
                    abortFuncs.current = abortFuncs.current.filter(a => a !== abortController);
                    return;
                }
                appStateContext?.dispatch({ type: 'UPDATE_CURRENT_CHAT', payload: resultConversation });
                setMessages([...resultConversation.messages]);
                return;
            }
            if (response?.body) {
                const reader = response.body.getReader();
                let runningText = "";

                while (true) {
                    setProcessMessages(messageStatus.Processing)
                    const { done, value } = await reader.read();
                    if (done) break;

                    var text = new TextDecoder("utf-8").decode(value);
                    const objects = text.split("\n");
                    objects.forEach((obj) => {
                        try {
                            runningText += obj;
                            result = JSON.parse(runningText);
                            result.choices[0].messages.forEach((obj) => {
                                obj.id = result.id;
                                obj.date = new Date().toISOString();
                            })
                            setShowLoadingMessage(false);
                            result.choices[0].messages.forEach((resultObj) => {
                                processResultMessage(resultObj, userMessage, conversationId);
                            })
                            runningText = "";
                        }
                        catch { }
                    });
                }

                let resultConversation;
                if (conversationId) {
                    resultConversation = appStateContext?.state?.chatHistory?.find((conv) => conv.id === conversationId)
                    if (!resultConversation) {
                        console.error("Conversation not found.");
                        setIsLoading(false);
                        setShowLoadingMessage(false);
                        abortFuncs.current = abortFuncs.current.filter(a => a !== abortController);
                        return;
                    }
                    isEmpty(toolMessage) ?
                        resultConversation.messages.push(assistantMessage) :
                        resultConversation.messages.push(toolMessage, assistantMessage)
                } else {
                    resultConversation = {
                        id: result.history_metadata.conversation_id,
                        title: result.history_metadata.title,
                        messages: [userMessage],
                        date: result.history_metadata.date
                    }
                    isEmpty(toolMessage) ?
                        resultConversation.messages.push(assistantMessage) :
                        resultConversation.messages.push(toolMessage, assistantMessage)
                }
                if (!resultConversation) {
                    setIsLoading(false);
                    setShowLoadingMessage(false);
                    abortFuncs.current = abortFuncs.current.filter(a => a !== abortController);
                    return;
                }
                appStateContext?.dispatch({ type: 'UPDATE_CURRENT_CHAT', payload: resultConversation });
                isEmpty(toolMessage) ?
                    setMessages([...messages, assistantMessage]) :
                    setMessages([...messages, toolMessage, assistantMessage]);
            }

        } catch (e) {
            if (!abortController.signal.aborted) {
                let errorMessage = "An error occurred. Please try again. If the problem persists, please contact the site administrator.";
                if (result.error?.message) {
                    errorMessage = result.error.message;
                }
                else if (typeof result.error === "string") {
                    errorMessage = result.error;
                }
                let errorChatMsg: ChatMessage = {
                    id: uuid(),
                    role: ERROR,
                    content: errorMessage,
                    date: new Date().toISOString()
                }
                let resultConversation;
                if (conversationId) {
                    resultConversation = appStateContext?.state?.chatHistory?.find((conv) => conv.id === conversationId)
                    if (!resultConversation) {
                        console.error("Conversation not found.");
                        setIsLoading(false);
                        setShowLoadingMessage(false);
                        abortFuncs.current = abortFuncs.current.filter(a => a !== abortController);
                        return;
                    }
                    resultConversation.messages.push(errorChatMsg);
                } else {
                    if (!result.history_metadata) {
                        console.error("Error retrieving data.", result);
                        setIsLoading(false);
                        setShowLoadingMessage(false);
                        abortFuncs.current = abortFuncs.current.filter(a => a !== abortController);
                        return;
                    }
                    resultConversation = {
                        id: result.history_metadata.conversation_id,
                        title: result.history_metadata.title,
                        messages: [userMessage],
                        date: result.history_metadata.date
                    }
                    resultConversation.messages.push(errorChatMsg);
                }
                if (!resultConversation) {
                    setIsLoading(false);
                    setShowLoadingMessage(false);
                    abortFuncs.current = abortFuncs.current.filter(a => a !== abortController);
                    return;
                }
                appStateContext?.dispatch({ type: 'UPDATE_CURRENT_CHAT', payload: resultConversation });
                setMessages([...messages, errorChatMsg]);
            } else {
                setMessages([...messages, userMessage])
            }
        } finally {
            setIsLoading(false);
            setShowLoadingMessage(false);
            abortFuncs.current = abortFuncs.current.filter(a => a !== abortController);
            setProcessMessages(messageStatus.Done)
        }
        return abortController.abort();

    }

    const clearChat = async () => {
        appStateContext?.state.audioService?.stopAudioPlayback();
        setClearingChat(true)
        if (appStateContext?.state.currentChat?.id && appStateContext?.state.isCosmosDBAvailable.cosmosDB) {
            let response = await historyClear(appStateContext?.state.currentChat.id)
            if (!response.ok) {
                setErrorMsg({
                    title: "Error clearing current chat",
                    subtitle: "Please try again. If the problem persists, please contact the site administrator.",
                })
                toggleErrorDialog();
            } else {
                appStateContext?.dispatch({ type: 'DELETE_CURRENT_CHAT_MESSAGES', payload: appStateContext?.state.currentChat.id });
                appStateContext?.dispatch({ type: 'UPDATE_CHAT_HISTORY', payload: appStateContext?.state.currentChat });
                setActiveCitation(undefined);
                setIsCitationPanelOpen(false);
                setMessages([])
            }
        }
        setClearingChat(false)
    };

    const newChat = () => {
        appStateContext?.state.audioService?.stopAudioPlayback();
        setProcessMessages(messageStatus.Processing)
        setMessages([])
        setIsCitationPanelOpen(false);
        setActiveCitation(undefined);
        appStateContext?.dispatch({ type: 'UPDATE_CURRENT_CHAT', payload: null });
        setProcessMessages(messageStatus.Done)
    };

    const stopGenerating = () => {
        abortFuncs.current.forEach(a => a.abort());
        setShowLoadingMessage(false);
        setIsLoading(false);
        // stop audio playback
        appStateContext?.state.audioService?.stopAudioPlayback();
    }

    useEffect(() => {
        if (appStateContext?.state.currentChat) {
            setMessages(appStateContext.state.currentChat.messages)
        } else {
            setMessages([])
        }
    }, [appStateContext?.state.currentChat]);

    useLayoutEffect(() => {
        const saveToDB = async (messages: ChatMessage[], id: string) => {
            const response = await historyUpdate(messages, id)
            return response
        }

        if (appStateContext && appStateContext.state.currentChat && processMessages === messageStatus.Done) {
            if (appStateContext.state.isCosmosDBAvailable.cosmosDB) {
                if (!appStateContext?.state.currentChat?.messages) {
                    console.error("Failure fetching current chat state.")
                    return
                }
                saveToDB(appStateContext.state.currentChat.messages, appStateContext.state.currentChat.id)
                    .then((res) => {
                        if (!res.ok) {
                            let errorMessage = "An error occurred. Answers can't be saved at this time. If the problem persists, please contact the site administrator.";
                            let errorChatMsg: ChatMessage = {
                                id: uuid(),
                                role: ERROR,
                                content: errorMessage,
                                date: new Date().toISOString()
                            }
                            if (!appStateContext?.state.currentChat?.messages) {
                                let err: Error = {
                                    ...new Error,
                                    message: "Failure fetching current chat state."
                                }
                                throw err
                            }
                            setMessages([...appStateContext?.state.currentChat?.messages, errorChatMsg])
                        }
                        return res as Response
                    })
                    .catch((err) => {
                        console.error("Error: ", err)
                        let errRes: Response = {
                            ...new Response,
                            ok: false,
                            status: 500,
                        }
                        return errRes;
                    })
            } else {
            }
            appStateContext?.dispatch({ type: 'UPDATE_CHAT_HISTORY', payload: appStateContext.state.currentChat });
            setMessages(appStateContext.state.currentChat.messages)
            setProcessMessages(messageStatus.NotRunning)
        }
    }, [processMessages]);

    useEffect(() => {
        if (AUTH_ENABLED !== undefined) {
            if (!AUTH_ENABLED) return;
            getUserInfoList();
        }
    }, [AUTH_ENABLED]);

    useLayoutEffect(() => {
        chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" })
    }, [showLoadingMessage, processMessages]);

    const onShowCitation = (citation: Citation) => {
        setActiveCitation(citation);
        setIsCitationPanelOpen(true);
    };

    const onViewSource = (citation: Citation) => {
        if (citation.url && !citation.url.includes("blob.core")) {
            window.open(citation.url, "_blank");
        }
    };

    const parseCitationFromMessage = (message: ChatMessage) => {
        if (message?.role && message?.role === "tool") {
            try {
                const toolMessage = JSON.parse(message.content) as ToolMessageContent;
                return toolMessage.citations;
            }
            catch {
                return [];
            }
        }
        return [];
    }

    const disabledButton = () => {
        return isLoading || (messages && messages.length === 0) || clearingChat || appStateContext?.state.chatHistoryLoadingState === ChatHistoryLoadingState.Loading
    }

    const sendChatQuestion = (question: string, id?: string | undefined) => {
        appStateContext?.state.isCosmosDBAvailable?.cosmosDB ? makeApiRequestWithCosmosDB(question, id) : makeApiRequestWithoutCosmosDB(question, id)
    }

    const toggleAudioMute = () => {
        setAudioMuted(!audioMuted);
        appStateContext?.state.audioService?.toggleMute();
    }

    useEffect(() => {
        if (appStateContext?.state.chatHistoryLoadingState !== ChatHistoryLoadingState.Loading) {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const paramQuestion = urlParams.get('askmsr');
                if (paramQuestion) {
                    sendChatQuestion(paramQuestion);
                }
            } catch (error) {
                console.error('Error occurred while processing URL parameters:', error);
            }
        }
    }, [appStateContext?.state.chatHistoryLoadingState]);

    return (
        <div className={styles.container} role="main">
            {showAuthMessage ? (
                <div className={styles.chatEmptyState}>
                    <ShieldLock48Regular />
                    <Title1 align="center">Authentication Not Configured</Title1>
                    <Subtitle1 align="center">
                        This app does not have authentication configured. Please add an identity provider by finding your app in the
                        <Link href="https://portal.azure.com/" target="_blank"> Azure Portal </Link>
                        and following
                        <Link href="https://learn.microsoft.com/en-us/azure/app-service/scenario-secure-app-authentication-app-service#3-configure-authentication-and-authorization" target="_blank"> these instructions</Link>.
                    </Subtitle1>
                    <Subtitle1 align="center">Authentication configuration takes a few minutes to apply.</Subtitle1>
                    <Subtitle1 align="center">If you deployed in the last 10 minutes, please wait and reload the page after 10 minutes.</Subtitle1>
                </div>
            ) : (
                <div className={styles.container}>
                    <div className={styles.chatContainer}>
                        {!messages || messages.length < 1 ? (
                            <div className={styles.chatEmptyState}>
                                {
                                    // Hide the logo for project green build
                                    false &&
                                    <Image
                                        src={LogoImage}
                                        height={120}
                                        width={120}
                                        aria-hidden="true"
                                    />
                                }
                                <span className={styles.title}>Questions about Project Green?</span>
                                <span className={styles.subtitle}>Project Green facilitates a dynamic research community within Microsoft by highlighting key trends, encouraging team formation around common goals, and identifying investment opportunities for impactful results.</span>
                                <SuggestionButtons
                                    onButtonClick={sendChatQuestion}
                                />
                            </div>
                        ) : (
                            <div className={styles.chatMessageStream} role="log">
                                {messages.map((answer, index) => (
                                    <div key={`answer-${index}`}>
                                        {
                                            answer.role === "user" ? (
                                                <div className={styles.questionDisplayRow}>
                                                    <QuestionDisplay
                                                        content={answer.content}
                                                    />
                                                </div>
                                            ) : (
                                                answer.role === "assistant" ? <div
                                                    style={{
                                                        marginBottom: '12px',
                                                        maxWidth: '80%',
                                                        display: 'flex'
                                                    }}>
                                                    <Answer
                                                        answer={{
                                                            answer: answer.content,
                                                            citations: parseCitationFromMessage(messages[index - 1]),
                                                            message_id: answer.id,
                                                            feedback: answer.feedback
                                                        }}
                                                        onCitationClicked={c => onShowCitation(c)}
                                                        isLastAnswer={index === messages.length - 1}
                                                    />
                                                </div> : answer.role === ERROR ? <div className={styles.chatMessageError}>
                                                    <div className={styles.chatMessageErrorContent}>
                                                        <ErrorCircleRegular />
                                                        <span>Error</span>
                                                    </div>
                                                    <span className={styles.chatMessageErrorContent}>{answer.content}</span>
                                                </div> : null
                                            )
                                        }
                                    </div>
                                ))}
                                {showLoadingMessage && (
                                    <>
                                        <div style={{
                                            marginBottom: '12px',
                                            maxWidth: '80%',
                                            display: 'flex'
                                        }}>
                                            <Answer
                                                answer={{
                                                    message_id: "generating",
                                                    answer: "Generating answer...",
                                                    citations: []
                                                }}
                                                onCitationClicked={() => null}
                                                isLastAnswer={true}
                                            />
                                        </div>
                                    </>
                                )}
                                <div ref={chatMessageStreamEnd} />
                            </div>
                        )}
                        <div className={styles.bottomSection}>
                            <div className={styles.stopGeneratingContainer}>
                                {
                                    // isLoading show Stop Generating button
                                    (isLoading && messages && messages.length > 0) && (
                                        <Button
                                            icon={<Stop24Regular />}
                                            aria-label="Stop generating"
                                            tabIndex={0}
                                            onClick={stopGenerating}
                                            onKeyDown={e => e.key === "Enter" || e.key === " " ? stopGenerating() : null}
                                        >
                                            Stop generating
                                        </Button>
                                    )
                                }
                                {
                                    // If audio is enabled, show speaker icon for mute/unmute
                                    SPEECH_ENABLED && (
                                        <Button
                                            appearance="transparent"
                                            size="large"
                                            icon={audioMuted ? <SpeakerMuteRegular /> : <Speaker224Regular />}
                                            aria-label={audioMuted ? "Unmute" : "Mute"}
                                            tabIndex={0}
                                            onClick={toggleAudioMute}
                                            onKeyDown={e => e.key === "Enter" || e.key === " " ? toggleAudioMute() : null}
                                            title={audioMuted ? "Unmute" : "Mute"}
                                        />
                                    )
                                }
                            </div>
                            <div className={styles.chatInputContainer}>
                                <div className={styles.chatInput}>
                                    <div className={styles.chatButtonsLeftContainer}>
                                        {
                                            appStateContext?.state.isCosmosDBAvailable?.status !== CosmosDBStatus.NotConfigured && (
                                                <Button
                                                    icon={<Add16Regular />}
                                                    onClick={newChat}
                                                    disabled={disabledButton()}
                                                    aria-label="start a new chat button"
                                                />
                                            )
                                        }
                                        <Button
                                            icon={<Broom16Regular />}
                                            onClick={appStateContext?.state.isCosmosDBAvailable?.status !== CosmosDBStatus.NotConfigured ? clearChat : newChat}
                                            disabled={disabledButton()}
                                            aria-label="clear chat button"
                                        />

                                    </div>
                                    <QuestionInput
                                        clearOnSend
                                        placeholder="Type a new question..."
                                        disabled={isLoading}
                                        onSend={sendChatQuestion}
                                        conversationId={appStateContext?.state.currentChat?.id ? appStateContext?.state.currentChat?.id : undefined}
                                        speechEnabled={SPEECH_ENABLED ? true : false}
                                    />

                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Citation Panel */}
                    <CitationDetails
                        open={((messages && messages.length > 0) && (isCitationPanelOpen && activeCitation)) ? true : false}
                        citation={activeCitation}
                        onClose={() => setIsCitationPanelOpen(false)}
                    />
                    <ChatHistoryPanel
                        open={appStateContext?.state.isChatHistoryOpen && appStateContext?.state.isCosmosDBAvailable?.status !== CosmosDBStatus.NotConfigured}
                    />
                </div>
            )}
            <Dialog
                open={!hideErrorDialog}
                onOpenChange={handleErrorDialogClose}
            >
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>{errorMsg?.title}</DialogTitle>
                        <DialogContent>
                            {errorMsg?.subtitle}
                        </DialogContent>
                        <DialogActions>
                            <DialogTrigger disableButtonEnhancement>
                                <Button appearance="secondary">Close</Button>
                            </DialogTrigger>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </div>
    );
};

export default Chat;
