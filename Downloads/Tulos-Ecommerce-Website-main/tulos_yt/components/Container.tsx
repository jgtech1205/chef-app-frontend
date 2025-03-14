import React from 'react'
import { cn } from "@/lib/utils";

interface Props{
    children:React.ReactNode;
    className?: string;
}

const Container = ({children,className}:Props) => {
  return (
    <div className={cn("max-w-screen-x1 mx-auto px-4",)}>{children}</div>
  )
}

export default Container
