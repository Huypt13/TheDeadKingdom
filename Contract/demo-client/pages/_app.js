import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className="border-b p-6">
        <p className="text-4xl font-bold">The Death Kingdom Marketplace</p>
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-4 text-teal-400">
              Index
            </a>
          </Link>
          <Link href="/marketplace">
            <a className="mr-6 text-teal-400">
              Marketplace
            </a>
          </Link>
          <Link href="/inventory">
            <a className="mr-6 text-teal-400">
              Inventory
            </a>
          </Link>
          <Link href="/buy-box">
            <a className="mr-6 text-teal-400">
              Selling Nft
            </a>
          </Link>
        </div>
      </nav>
      <br></br>
      <br></br>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp