import Link from 'next/link'
import Image from 'next/image'
import logo from '@/public/logo.png'

export default function Logo() {
  return (
    <Link href="/" className="block" aria-label="Cruip">
      <div className="flex items-center md:h-3">
        <Image src={logo} alt='Logo' height={20} />
      </div>
    </Link>
  )
}
