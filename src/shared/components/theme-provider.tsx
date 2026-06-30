import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

export type ThemePreference = "light" | "dark" | "system";

type ThemeContextValue = Readonly<{
    theme: ThemePreference;
    setTheme: (theme: ThemePreference) => void;
}>;

const THEME_STORAGE_KEY = "maintenance-console-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemePreference(value: string | null): value is ThemePreference {
    return value === "light" || value === "dark" || value === "system";
}

function getThemeStorage(): Storage | null {
    try {
        return window.localStorage ?? null;
    } catch {
        return null;
    }
}

function getInitialTheme(): ThemePreference {
    const storedTheme = getThemeStorage()?.getItem(THEME_STORAGE_KEY) ?? null;
    return isThemePreference(storedTheme) ? storedTheme : "system";
}

function resolveTheme(theme: ThemePreference): "light" | "dark" {
    if (theme !== "system") {
        return theme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

function applyTheme(theme: ThemePreference): void {
    const resolvedTheme = resolveTheme(theme);
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.style.colorScheme = resolvedTheme;
}

export type ThemeProviderProps = Readonly<{
    children: ReactNode;
}>;

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setThemeState] = useState<ThemePreference>(getInitialTheme);

    useEffect(() => {
        applyTheme(theme);
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleSystemThemeChange = () => {
            if (theme === "system") {
                applyTheme(theme);
            }
        };

        mediaQuery.addEventListener("change", handleSystemThemeChange);
        return () => {
            mediaQuery.removeEventListener("change", handleSystemThemeChange);
        };
    }, [theme]);

    function setTheme(nextTheme: ThemePreference): void {
        setThemeState(nextTheme);
        getThemeStorage()?.setItem(THEME_STORAGE_KEY, nextTheme);
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);
    if (context === null) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
}
