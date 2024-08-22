"use client";

import { Button } from '@radix-ui/themes';
import { useState } from 'react'
import { twJoin } from 'tailwind-merge'

import Brand from "@/app/components/Brand"
import NavLink from "@/app/components/NavLink"

import Wallet from '../Wallet';

const Navbar = () => {
    const [state, setState] = useState(false)

    const handleNavMenu = () => {
        setState(!state)
        document.body.classList.toggle("overflow-hidden")
    }

    return (
        <header className='fixed top-0 w-full z-40'>
            <nav className={twJoin("w-full md:static md:text-sm flex", state && "fixed z-10 h-full", "md:bg-[#F5F1EB] bg-transparent")}>
                <div className="md:custom-screen md:mx-auto gap-2 md:py-5 md:flex flex w-full md:w-auto items-end md:items-center flex-col md:flex-row lg:w-[990px]">
                    <div className="custom-screen items-center mx-auto p-4 md:p-0 flex justify-between w-full bg-[#F5F1EB] md:bg-transparent">
                        <Brand />
                        <div className="md:hidden">
                            <button role="button" aria-label="Open the menu" className="text-gray-500 hover:text-gray-800"
                                onClick={handleNavMenu}
                            >
                                {
                                    state ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="size-6" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                        </svg>
                                    )
                                }
                            </button>
                        </div>
                    </div>
                    <div className={`flex-1 pb-3 md:pb-0 md:flex ${state ? "" : "hidden"} justify-between align-middle`}>
                        <div className="flex">
                            <Wallet />
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}

export default Navbar