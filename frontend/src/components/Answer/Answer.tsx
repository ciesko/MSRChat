import { useEffect, useMemo, useState } from "react";
import { useBoolean } from "@fluentui/react-hooks";

import { AskResponse, Citation } from "../../api";
import { parseAnswer } from "./AnswerParser";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import supersub from 'remark-supersub'
import { Button, Caption1, Card, CardFooter, Text } from "@fluentui/react-components";
import { AnswerStyles } from "./AnswerStyles";
import { ChevronDown24Regular, ChevronRight24Regular } from "@fluentui/react-icons";

interface Props {
    answer: AskResponse;
    onCitationClicked: (citedDocument: Citation) => void;
}

export const Answer = ({
    answer,
    onCitationClicked
}: Props) => {
    const styles = AnswerStyles();
    const [isRefAccordionOpen, { toggle: toggleIsRefAccordionOpen }] = useBoolean(false);
    const filePathTruncationLimit = 50;

    const parsedAnswer = useMemo(() => parseAnswer(answer), [answer]);
    const [chevronIsExpanded, setChevronIsExpanded] = useState(isRefAccordionOpen);

    const handleChevronClick = () => {
        setChevronIsExpanded(!chevronIsExpanded);
        toggleIsRefAccordionOpen();
    };

    useEffect(() => {
        setChevronIsExpanded(isRefAccordionOpen);
    }, [isRefAccordionOpen]);

    const createCitationFilepath = (citation: Citation, index: number, truncate: boolean = false) => {
        let citationFilename = "";

        if (citation.filepath && citation.chunk_id) {
            if (truncate && citation.filepath.length > filePathTruncationLimit) {
                const citationLength = citation.filepath.length;
                citationFilename = `${citation.filepath.substring(0, 20)}...${citation.filepath.substring(citationLength - 20)} - Part ${parseInt(citation.chunk_id) + 1}`;
            }
            else {
                citationFilename = `${citation.filepath} - Part ${parseInt(citation.chunk_id) + 1}`;
            }
        }
        else if (citation.filepath && citation.reindex_id) {
            citationFilename = `${citation.filepath} - Part ${citation.reindex_id}`;
        }
        else {
            citationFilename = `Citation ${index}`;
        }
        return citationFilename;
    }

    return (
        <>
            <Card
                tabIndex={0}
                className={styles.card}            >
                <div>
                    <ReactMarkdown
                        linkTarget="_blank"
                        remarkPlugins={[remarkGfm, supersub]}
                        children={parsedAnswer.markdownFormatText}
                        className={styles.answerText}
                    />
                </div>
                <div className={styles.answerFooter}>
                    {!!parsedAnswer.citations.length && (
                        <div
                            onKeyDown={e => e.key === "Enter" || e.key === " " ? toggleIsRefAccordionOpen() : null}
                        >
                            <div>
                                <div className={styles.citationHeader}>
                                    <Text
                                        className={styles.accordionTitle}
                                        onClick={toggleIsRefAccordionOpen}
                                        aria-label="Open references"
                                        tabIndex={0}
                                        role="button"
                                    >
                                        <span>{parsedAnswer.citations.length > 1 ? parsedAnswer.citations.length + " references" : "1 reference"}</span>
                                    </Text>
                                    <Button
                                        appearance="transparent"
                                        onClick={handleChevronClick}
                                        icon={chevronIsExpanded ? <ChevronDown24Regular /> : <ChevronRight24Regular />}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {chevronIsExpanded &&
                    <div className={styles.citationListContainer}>
                        {parsedAnswer.citations.map((citation, idx) => {
                            return (
                                <Card
                                    appearance="outline"
                                    title={createCitationFilepath(citation, ++idx)}
                                    tabIndex={0}
                                    role="link"
                                    key={idx}
                                    onClick={() => onCitationClicked(citation)}
                                    onKeyDown={e => e.key === "Enter" || e.key === " " ? onCitationClicked(citation) : null}
                                    aria-label={createCitationFilepath(citation, idx)}
                                >
                                    <div className={styles.citationCardContent}>
                                        <div>{`${idx} - `}</div>
                                        {createCitationFilepath(citation, idx, true)}
                                    </div>
                                </Card>);
                        })}
                    </div>
                }
                <CardFooter>
                    <Caption1>AI-generated content may be incorrect</Caption1>
                </CardFooter>
            </Card>
        </>
    );
};
