import { createContext, useState } from "react";

export const AccountInfoContext = createContext<any>(undefined);


export const AccountInfoProvider = ({ children }) => {
    const [data, setdata] = useState({})

    return <AccountInfoContext.Provider value={[data, setdata]}>
        {children}
    </AccountInfoContext.Provider>;
};