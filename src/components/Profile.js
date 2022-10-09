import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from 'react-cookie';

function Profile() {
  const navigate = useNavigate();
  const CryptoJS = require("crypto-js");

  const [ cookies, setCookies, removeCookies ] = useCookies(['WEB']);
  const [ userData, setUserData ] = useState({ username : '', email : '' })

  useEffect(() => {
    if (cookies.WEB == undefined) {
      navigate('/')
    } else {
      try {
        var encrypt_userData = cookies.WEB
        var bytes  = CryptoJS.AES.decrypt(encrypt_userData, process.env.REACT_APP_PASSPHRASE);
        var decrypt_userData = bytes.toString(CryptoJS.enc.Utf8);
        setUserData(JSON.parse(decrypt_userData))
      } catch (error) {
        // console.log(error)
        setUserData({ username : '', email : '' })
        removeCookies('WEB')
        navigate('/')
      }
    }
  }, [])

  const onLogout = () => {
    setUserData({ username : '', email : '' })
    removeCookies('WEB')
    navigate('/')
  }

  return (
    <div className="relative flex flex-col justify-center min-h-screen overflow-hidden bg-purple-900">
      <div className="w-full p-6 m-auto bg-white rounded-md shadow-md lg:max-w-xl">
        <h1 className="text-3xl font-semibold text-center text-purple-700 underline">
          Profile
        </h1>
        <form className="mt-6" >

          <div className="mb-2">
            <label htmlFor="Username" className="block text-sm font-semibold text-gray-800">
              Username
            </label>
            <input
              type="username"
              className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
              value={userData.username}
              disabled
            />
          </div>
          <div className="mb-2">
            <label htmlFor="Email" className="block text-sm font-semibold text-gray-800">
              Email
            </label>
            <input
              type="Email"
              className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
              value={userData.email}
              disabled
            />
          </div>
          <div className="mt-6">
            <button onClick={() => onLogout()} className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:bg-purple-600">
              Log out
            </button >
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile