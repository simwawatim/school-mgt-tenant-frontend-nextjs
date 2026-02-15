"use client"; 

import { useState } from "react";
import HeaderComp from "../base/header";
import SidebarComp from "../base/sidenav";
import TransactionTable from "./TransactionTable"

const TransactionPageComp = () => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <div className="flex flex-col h-screen">
            <HeaderComp isOpen={isOpen} toggleSidebar={toggleSidebar} />
            <div className="flex flex-1 overflow-hidden">
                <SidebarComp isOpen={isOpen} toggleSidebar={toggleSidebar} />
                <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-white lg:ml-[250px]">
                    <TransactionTable/>
                </main>
            </div>
        </div>
    )
}
export default TransactionPageComp