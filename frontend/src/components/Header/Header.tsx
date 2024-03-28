import * as React from "react";
import { HeaderStyles } from "./HeaderStyles";
import { Button, Image, Link } from "@fluentui/react-components";
import { Book16Regular, PersonFeedback16Regular } from "@fluentui/react-icons";
import { useEffect, useState } from "react";

export interface IHeaderProps {
    azureImageUrl: string;
    onShareClick: () => void;
    onHistoryClick: () => void;
    appStateContext: any;
}

export const Header: React.FunctionComponent<IHeaderProps> = (
    props: React.PropsWithChildren<IHeaderProps>
) => {
    const styles = HeaderStyles();
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 600);

    useEffect(() => {
        const checkSize = () => setIsSmallScreen(window.innerWidth < 600);

        window.addEventListener('resize', checkSize);

        // Cleanup function
        return () => window.removeEventListener('resize', checkSize);
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.titleContainer}>
                <Image
                    src={props.azureImageUrl}
                    aria-hidden="true"
                    className={styles.logoImage}
                />
                <span className={styles.verticalBar}>|</span>
                <Link href="/" className={styles.headerTitle}>
                    MSR Project Green copilot
                </Link>
            </div>
            <div className={styles.rightCommandBar}>
                <Button
                    appearance="primary"
                    as="a"
                    title="Project Green Briefing Book page"
                    href="https://microsoft.sharepoint.com/sites/microsoft-research-internal/SitePages/MSR-copilot.aspx"
                    icon={isSmallScreen ? <Book16Regular /> : undefined}
                >
                    {isSmallScreen ? '' : 'Project Green Briefing Book'}
                </Button>
                <Button
                    appearance="primary" 
                    as="a" 
                    title="Submit feedback"
                    href="mailto:MSRCopilotFeedback@microsoft.com"
                    icon={isSmallScreen ? <PersonFeedback16Regular /> : undefined}
                >
                    {isSmallScreen ? '' : 'Submit feedback'}
                </Button>
            </div>
        </div>
    );
};
