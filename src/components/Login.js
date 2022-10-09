import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from 'react-cookie';

import Swal from 'sweetalert2'
import bcrypt from 'bcryptjs'
import ReCAPTCHA from 'react-google-recaptcha'

import * as userModel from '../firebase/userModel'
import * as Validator from '../helpers/Validator'

function Login() {
  const navigate = useNavigate();
  const captchaRef = useRef(null)
  const CryptoJS = require("crypto-js");

  const [ loginForm, setLoginForm ] = useState({ username : '', password : '' })
  const [ captcha, setCaptcha ] = useState(true)
  const [ cookies, setCookies, removeCookies ] = useCookies(['WEB']);

  function onLoginSubmit(event) {
    event.preventDefault();
    const token = captchaRef.current.getValue();
    captchaRef.current.reset();

    var isInvalidForm = false;
    if (captcha) 
      isInvalidForm = "Please verify captcha."
    if (Validator.hasBadLength(loginForm.username))
      isInvalidForm = Validator.invalidUsername(loginForm.username)
    if (Validator.hasBadLength(loginForm.password))
      isInvalidForm = Validator.invalidPassword(loginForm.password)
  
    if (isInvalidForm) {
      Swal.fire({ title: 'Login failed!', text: isInvalidForm, icon: 'error', confirmButtonText: 'Cool' })
    } else {
      userModel.Login(loginForm, loginSuccess, loginFailed, emailNotVerify);
    } 
  }
  
  function test() {
    var data = { username: 'mrtanatorn01', password: 'mrtanatorN_01' }
    userModel.Login(data, loginSuccess, loginFailed, emailNotVerify);
  }

  const loginSuccess = (user) => {
    var userData = { username : user.username, email : user.email }
    var encrypt_userData = CryptoJS.AES.encrypt( JSON.stringify(userData), process.env.REACT_APP_PASSPHRASE).toString()
    setCookies('WEB', encrypt_userData, 1800);
    Swal.fire({ title: 'Login success!', text: 'Success', icon: 'success', confirmButtonText: 'Go to profile' })
      .then(() => {
        navigate('profile')
      });
  }
  const loginFailed = (msg) => {
    Swal.fire({ title: 'Login failed!', text: 'Username or Password incorrect!', icon: 'error', confirmButtonText: 'Close' })
    // console.log('login failed :', msg)
  }
  const emailNotVerify = (email) => {
    Swal.fire({ title: 'Verification needed!', text: 'Click "verify" button to send verification to your email (' + email + ').',  icon: 'warning', showCancelButton: true, confirmButtonText: 'Send verify to email', denyButtonText: `Back`, })
      .then((result) => {
        if (result.isConfirmed) {
          Swal.fire('not done!', 'not done', 'error')
        }
      })
    // console.log('email not verify :', email)
  }

  return (
    <div className="relative flex flex-col justify-center min-h-screen overflow-hidden bg-purple-900">
      <div className="w-full p-6 m-auto bg-white rounded-md shadow-md lg:max-w-xl">
        <h1 className="text-3xl font-semibold text-center text-purple-700 underline">
          Sign in
        </h1>
        <button onClick={() => test()}
          className="bg-red-500"
        >
          test login with exist account
        </button >

        <form className="mt-6" noValidate onSubmit={(e) => onLoginSubmit(e)}>
          <div className="mb-2">
            <label htmlFor="Username" className="block text-sm font-semibold text-gray-800">
              Username
            </label>
            <input
              type="username"
              className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              required
            />
            <label className="text-sm text-red-800">{Validator.hasBadLength(loginForm.username)}</label>
          </div>
          <div className="mb-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-800"
            >
              Password
            </label>
            <input
              type="password"
              className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              required
            />
            <label className="text-sm text-red-800">{Validator.hasBadLength(loginForm.password)}</label>
          </div>
          <p className="mt-4 text-xs text-purple-600 hover:underline" >
            <Link to="/Recovery">
              <b>Forget Password?</b>
            </Link>
          </p>
          
          <div className="mt-6">
            <ReCAPTCHA
              className="my-3"
              sitekey={process.env.REACT_APP_RECAPTCHA_KEY}
              badge= 'inline'
              ref={captchaRef}
              onChange={() => {setCaptcha(false);}}
            />
            <button disabled={captcha} type="submit" 
              className= {
                captcha ?
                "bg-zinc-500 w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform  rounded-md hover:bg-zinc-500 focus:outline-none focus:bg-purple-600"
                :
                "bg-purple-700 w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform  rounded-md hover:bg-purple-600 focus:outline-none focus:bg-purple-600"
              }
            >
              Login
            </button >
          </div>
        </form>
        <p className="mt-4 text-xs font-light text-center text-gray-700">
          {" "}Don't have an account?{" "}
          <Link to="/Register">
            <b className="mt-4 text-xs font-bold text-center text-gray-700 underline">Create Account</b>
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login