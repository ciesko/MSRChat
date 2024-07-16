import { AskResponse, Citation } from "../../api";
import { cloneDeep } from "lodash-es";

type ParsedAnswer = {
    citations: Citation[];
    markdownFormatText: string;
    state?: any;
};

export function parseAnswer(answer: AskResponse): ParsedAnswer {
    let answerText = answer.answer;
    let state = {};
    
    // Extract State by looking for --START STATE-- and --END STATE--
    const startStateIndex = answerText.indexOf("--START STATE--");
    const endStateIndex = answerText.indexOf("--END STATE--");
    if (startStateIndex !== -1 && endStateIndex !== -1) {
        state = answerText.slice(startStateIndex + "--START STATE--".length, endStateIndex);
        answerText = answerText.slice(0, startStateIndex) + answerText.slice(endStateIndex + "--END STATE--".length);   
    }

    const citationLinks = answerText.match(/\[(doc\d\d?\d?)]/g);

    const lengthDocN = "[doc".length;

    let filteredCitations = [] as Citation[];
    let citationReindex = 0;
    citationLinks?.forEach(link => {
        // Replacing the links/citations with number
        let citationIndex = link.slice(lengthDocN, link.length - 1);
        let citation = cloneDeep(answer.citations[Number(citationIndex) - 1]) as Citation;
        if (!filteredCitations.find((c) => c.id === citationIndex) && citation) {
          answerText = answerText.replaceAll(link, ` ^${++citationReindex}^ `);
          citation.id = citationIndex; // original doc index to de-dupe
          citation.reindex_id = citationReindex.toString(); // reindex from 1 for display
          filteredCitations.push(citation);
        }
    });
    
    return { 
        citations: filteredCitations,
        markdownFormatText: answerText,
        state: state
    };
}
