import { Link } from 'react-router-dom'

function Home () {
  return (
    <div>
      <h1 className='mt-10 text-3xl text-center'>Short URL</h1>
      <div className='mt-5 flex flex-col items-center justify-center gap-4'>
        <Link to={'/short'}>
          <button className='px-4 py-2 bg-black text-white rounded-full cursor-pointer'>
            Short URL
          </button>
        </Link>
        <Link to={'/stats'}>
          <button className='px-4 py-2 bg-black text-white rounded-full cursor-pointer'>
            Get Stats of URL
          </button>
        </Link>
      </div>
    </div>
  )
}

export default Home
