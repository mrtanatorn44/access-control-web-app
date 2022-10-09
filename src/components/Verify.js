import React from 'react'

function Verify() {
  return (
    <div className="relative flex flex-col justify-center min-h-screen overflow-hidden bg-purple-900">
    <div className="w-full p-6 m-auto bg-white rounded-md shadow-md lg:max-w-xl">
      <h1 className="text-3xl font-semibold text-center text-purple-700 underline">
        Verify Successfully
      </h1>
      <form className="mt-6" >
        <p className="mt-4 text-base font-normal text-center text-gray-700">
            Email:
        </p>
        <div className="mt-6">
          <button className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:bg-purple-600">
            OK
          </button >
        </div>
      </form>
    </div>
  </div>
  )
}

export default Verify