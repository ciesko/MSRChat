import { Outlet } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AppStateContext } from "../../state/AppProvider";
import { LayoutStyles } from "./LayoutStyles";
import { Subtitle1 } from "@fluentui/react-components";

const Layout = ({ isDarkTheme, embedDisplay }: { isDarkTheme: boolean, embedDisplay: boolean }) => {
    const styles = LayoutStyles();
    const appStateContext = useContext(AppStateContext);

    useEffect(() => { }, [appStateContext?.state.isCosmosDBAvailable.status]);

    return (
        <div className={styles.page}>
            <div className={styles.coffeeHeader}>
                <Subtitle1>{appStateContext?.state.frontendSettings?.frontpage_heading}</Subtitle1>
            </div>
            <div className={styles.containerEmbed}>
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
