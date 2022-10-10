import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom";

import { useCookies } from 'react-cookie';

import * as userModel from "../firebase/userModel"

function Profile() {
  const navigate = useNavigate();
  const CryptoJS = require("crypto-js");
  const [ logs, setLogs ] = useState([]);

  const [ cookies, setCookies, removeCookies ] = useCookies(['WEB']);
  const [ userData, setUserData ] = useState({ username : '', email : '' })

  useEffect(() => {
    
    if (cookies.WEB === undefined) {
      navigate('/')
    } else {
      
      userModel.readLog((data) => setLogs(data));
      try {

        var encrypt_userData = cookies.WEB
        var bytes  = CryptoJS.AES.decrypt(encrypt_userData, process.env.REACT_APP_PASSPHRASE);
        var decrypt_userData = bytes.toString(CryptoJS.enc.Utf8);
        // console.log(cookies.WEB);
        fetch('https://ipgeolocation.abstractapi.com/v1/?api_key=' + process.env.REACT_APP_ABSTRACTAPI_APIKEY)
          .then((response) => response.json())
          .then((data) => {
            // console.log(data)
            var publicIp = data.ip_address
            var user_json = JSON.parse(decrypt_userData)
            // console.log(user_json)
            // console.log(user_json.ip)
            // console.log(publicIp)
            if (user_json.ip !== publicIp) {
              removeCookies('WEB')
              navigate('/')
            }
            setUserData(JSON.parse(decrypt_userData))
        });
      } catch (error) {
        // console.log(error)
        setUserData({ username : '', email : '' })
        removeCookies('WEB')
        navigate('/')
      }
    }

  }, [])

  const onLogout = () => {
    userModel.writeLog('INFO', `Username: ${userData.username} has logged-out.`)
    setUserData({ username : '', email : '' })
    removeCookies('WEB')
    navigate('/')
  }

  return (
    <div className="relative flex flex-col justify-center min-h-screen overflow-hidden bg-purple-900 py-6">
      <div className="grid grid-cols-1 gap-3 w-full p-6 m-auto bg-white rounded-md shadow-md max-w-max">
        {/* {console.log(new Date(new Date().toLocaleString('en', {timeZone: 'Asia/Bangkok'}))} */}

        <div className='columns-1'>
          <h1 className="text-3xl font-semibold text-center text-purple-700 underline">
            Profile
          </h1>
          {/* <form className="mt-6" > */}

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
          {/* </form> */}
        </div>
        <div className='columns-1'>
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <div className="p-1.5 w-full inline-block align-middle">
                <div className="overflow-hidden border rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase " >
                          NO
                        </th>
                        <th scope="col" className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase " >
                          Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase " >
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase " >
                          Text
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {logs.map((log, index) => {
                        return (
                          <tr key={index}>
                            <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                              {index+1}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                              {log.timestamp.toDate().toLocaleDateString() + '-' + log.timestamp.toDate().toLocaleTimeString()} 
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                              {log.type}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                              {log.text}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile