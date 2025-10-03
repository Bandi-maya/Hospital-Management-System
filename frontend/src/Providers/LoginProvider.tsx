import { createContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

type LoginContextType = [any, Dispatch<SetStateAction<any>>];

export const LoginContext = createContext<LoginContextType>([null, () => {}]);

export default function LoginProvider({ children }: { children: ReactNode }) {
    const [loginData, setLoginData] = useState<any>(null);

    return (
        <LoginContext.Provider value={[loginData, setLoginData]}>
            {children}
        </LoginContext.Provider>
    );
}