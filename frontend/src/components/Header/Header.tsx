import * as React from "react";
import { HeaderStyles } from "./HeaderStyles";
import { Button, Image, Link, Title3 } from "@fluentui/react-components";
import { ArrowLeft16Filled } from "@fluentui/react-icons";
import { HistoryButton, ShareButton } from "../common/Button";

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
          title="Click to go to Project Green Briefing Book page"
          href="https://microsoft.sharepoint.com/sites/microsoft-research-internal/SitePages/MSR-copilot.aspx"
        >
          Project Green Briefing Book
        </Button>
        <Button 
          appearance="primary" as="a" href="mailto:MSRCopilotFeedback@microsoft.com">
          Submit feedback
        </Button>
      </div>
    </div>
  );
};
