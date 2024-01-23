// Create a theme service to handle the theme of the application using fluent 2

import { Theme, teamsDarkTheme, teamsLightTheme } from "@fluentui/react-components";

export default class ThemeService {
    public getTheme(): Theme {
        return teamsDarkTheme;
    }
};
