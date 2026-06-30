import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    useTheme,
    type ThemePreference,
} from "@/shared/components/theme-provider";

function isThemePreference(value: string): value is ThemePreference {
    return value === "light" || value === "dark" || value === "system";
}

const themeIcons = {
    light: SunIcon,
    dark: MoonIcon,
    system: MonitorIcon,
} as const;

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const ThemeIcon = themeIcons[theme];

    function handleThemeChange(value: string): void {
        if (isThemePreference(value)) {
            setTheme(value);
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-11"
                    aria-label="Choose color theme"
                >
                    <ThemeIcon aria-hidden="true" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                    value={theme}
                    onValueChange={handleThemeChange}
                >
                    <DropdownMenuRadioItem value="system" className="min-h-11">
                        <MonitorIcon aria-hidden="true" />
                        System
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="light" className="min-h-11">
                        <SunIcon aria-hidden="true" />
                        Light
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark" className="min-h-11">
                        <MoonIcon aria-hidden="true" />
                        Dark
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
