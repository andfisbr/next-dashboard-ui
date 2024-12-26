//
//
//
import React, { createContext, useContext, useEffect, useState } from 'react'


const RoleContext = createContext<string | undefined>(undefined)


export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
        const [role, setRole] = useState<string | undefined>()
        useEffect(() => {
                fetch("/default")
                        .then((response) => response.headers.get("X-User-Role"))
                        .then((role) => setRole(role || "default"))
                        .catch((error) => console.error("Erro ao carregar a role:", error))
        }, [])



        return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>
}


export const useRole = () => {
        return useContext(RoleContext)
}
