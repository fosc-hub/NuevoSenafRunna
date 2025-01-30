import Navbar from "@/components/layoutComponents/Navbar";

export default function Layout({ children }: Readonly<{
    children: React.ReactNode;
  }>) {
 
  return (
    <div>
      <Navbar></Navbar>
      {children}
    </div>
  )
}
