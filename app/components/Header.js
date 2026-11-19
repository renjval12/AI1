import Image from "next/image"
import Link from "next/link"

const Header = () => {
  return (
    <div className="flex flex-row justify-between items-center m-2 bg-[#f1e2f4] p-2 rounded-md">
      <div id="logo">
        <Link href="/"><Image src="/logo.png" width={50} height={50}/></Link>
      </div>
      <div id="links">
        <Link href="/architecture-diagram" className="text-black">Architecture Diagram</Link>
      </div>
      <div id="login-signup">
        <Link href="/login" className="mx-1">Log In</Link>
        <Link href="/signup" className="mx-1"><button className="px-4 py-1 bg-[#9667d0] rounded-full cursor-pointer hover:border-2 hover:border-black">Create account</button></Link>
      </div>
    </div>
  )
}

export default Header