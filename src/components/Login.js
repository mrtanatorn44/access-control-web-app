import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from 'react-cookie';

import Swal from 'sweetalert2'
import ReCAPTCHA from 'react-google-recaptcha'
import emailjs from '@emailjs/browser';

import * as userModel from '../firebase/userModel'
import * as Validator from '../helpers/Validator'

function Login() {
  const navigate = useNavigate();
  const captchaRef = useRef(null)
  const CryptoJS = require("crypto-js");

  const [ showPassword, setShowPassword ] = useState(false)
  const [ loginForm, setLoginForm ] = useState({ username : '', password : '' })
  const [ captcha, setCaptcha ] = useState(true)
  const [ cookies, setCookies, removeCookies ] = useCookies(['WEB']);

  useEffect(() => {
    if (cookies.WEB != undefined) {
      try {
        // try to decrypt cookie and tranform to JSON
        // if it can convert to JSON it mean cookie cipher is real readable data
        // then navigate to profile
        var encrypt_userData = cookies.WEB
        var bytes  = CryptoJS.AES.decrypt(encrypt_userData, process.env.REACT_APP_PASSPHRASE);
        var decrypt_userData = bytes.toString(CryptoJS.enc.Utf8);
        var userData = (JSON.parse(decrypt_userData))
        navigate('/profile')
      } catch (error) {
        // in case of cipher cookie was wrong
        // console.log(error)
        removeCookies('WEB')
        navigate('/')
      }
    }
  }, [])

  function onLoginSubmit(event) {
    event.preventDefault();
    const token = captchaRef.current.getValue();
    captchaRef.current.reset();

    // Check username, password format
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
      userModel.Login(loginForm, loginSuccess, loginFailed, emailNotVerify, expiredPassword);
    } 
  }

  const loginSuccess = async (user) => {
    try {
      await fetch('https://ipgeolocation.abstractapi.com/v1/?api_key=' + process.env.REACT_APP_ABSTRACTAPI_APIKEY)
        .then((response) => response.json())
        .then((data) => {
          // collecting user IP, USERNAME, EMAIL and encrypt then store in cookie
          var publicIp = data.ip_address
          var userData = { username : user.username, email : user.email, ip : publicIp }
          var encrypt_userData = CryptoJS.AES.encrypt( JSON.stringify(userData), process.env.REACT_APP_PASSPHRASE).toString()
          setCookies('WEB', encrypt_userData, { maxAge: 1800 }); // 30 minutes expire
          Swal.fire({ title: 'Login success!', text: 'Success', icon: 'success', confirmButtonText: 'Go to profile' })
            .then(() => { navigate('/profile') });
      });
    } catch (error) {
      // in case of storing user data in cookie not working
      // cause of api not work or cookie not enable
      // console.error(error)
      Swal.fire({ title: 'Login failed!', text: 'Error', icon: 'error', confirmButtonText: 'Cool' })
        .then(() => { navigate(0) });
    }
  }
  const loginFailed = (msg) => {
    Swal.fire({ title: 'Login failed!', text: 'Username or Password incorrect!', icon: 'error', confirmButtonText: 'Close' })
      .then(() => { navigate(0) });
  }
  const emailNotVerify = (obj) => {
    Swal.fire({ title: 'Verification needed!', text: 'Click "verify" button to send verification to your email (' + obj.email + ').',  icon: 'warning', showCancelButton: true, confirmButtonText: 'Send verify to email', denyButtonText: `Back`, })
      .then((result) => { if (result.isConfirmed) { sendNewVerify(obj.verify_hash) } })
  }
    const sendNewVerify = (oldHash) => {
      userModel.sendVerify(oldHash, sendVerifySuccess, sendVerifyUnsuccess)
    }
      const sendVerifySuccess = async (user) => {
        await emailjs_sendEmailVerifyLink(user)
        Swal.fire({ title: 'Send verify success', text:"We have sent verify link to your email (" + (user.email) + ').', icon: 'success', confirmButtonText: 'Back' })
      }
      const sendVerifyUnsuccess = (msg) => {
        Swal.fire({ title: 'Send verify failed', text: msg, icon: 'error', confirmButtonText: 'Back' })
      }

  const expiredPassword = (user) => { 
    Swal.fire({ title: 'Password expired!', text: 'You haven\'t change your password since (' + user.time_password.toDate().toString() +
      '), Click "Sent" button to send reset password link to your email (' + user.email + ').',  icon: 'warning', showCancelButton: true, confirmButtonText: 'Send link to email', denyButtonText: `Back`, })
      .then( async (result) => { if (result.isConfirmed) {
        userModel.sendResetPw(user.email, sendResetPwSuccess, sendResetPwUnsuccess)
      }})
  }
    const sendResetPwSuccess = async (user) => {
      await emailjs_sendResetPasswordLink(user)
      Swal.fire({ title: 'Send link success', text:"We have sent reset password link to your email (" + (user.email) + ').', icon: 'success', confirmButtonText: 'Back' })
    }
    const sendResetPwUnsuccess = (msg) => {
      Swal.fire({ title: 'Send link failed', text: msg, icon: 'error', confirmButtonText: 'Back' })
    }
  
  // Send Reset Password link to email
  const emailjs_sendResetPasswordLink = (user) => {
    var templateParams = {
      target_email: user.email,
      username: user.username,
      verify_link: window.location.origin.toString() + '/reset?key=' + user.reset_hash
    };
    emailjs.send(
      process.env.REACT_APP_EMAILJS_SERVICEID, 
      process.env.REACT_APP_EMAILJS_TEMPLATEID_RESET, 
      templateParams, 
      process.env.REACT_APP_EMAILJS_PUBLICKEY
    )
      .then((result) => {
        // console.log(result.text);
      }, (error) => {
        // console.log(error.text);
      });
  };
  
  // Send Verify Email link to email
  const emailjs_sendEmailVerifyLink = (user) => {
    var templateParams = {
      target_email: user.email,
      username: user.username,
      verify_link: window.location.origin.toString() + '/verify?key=' + user.verify_hash
    };
    emailjs.send(
      process.env.REACT_APP_EMAILJS_SERVICEID, 
      process.env.REACT_APP_EMAILJS_TEMPLATEID_VERIFY, 
      templateParams, 
      process.env.REACT_APP_EMAILJS_PUBLICKEY
    )
      .then((result) => {
        // console.log(result.text);
      }, (error) => {
        // console.log(error.text);
      });
  };

  return (
    <div className="relative flex flex-col justify-center min-h-screen overflow-hidden bg-purple-900">
      <div className="w-full p-6 m-auto bg-white rounded-md shadow-md lg:max-w-xl">
        <h1 className="text-3xl font-semibold text-center text-purple-700 underline">
          Sign in
        </h1>
        {/* <button onClick={() => test()}
          className="bg-red-500"
        >
          test login with exist account
        </button > */}

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
              type={ showPassword ? "text" : "password" }
              className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              required
            />
            <label className="text-sm text-red-800">{Validator.hasBadLength(loginForm.password)}</label>
          </div>
          <div className="mt-4">
            <input
              id="checkboxShowPassword"
              type="checkbox"
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="checkboxShowPassword">
              {" "}Show password
            </label>
          </div>
          <p className="mt-4 text-sm text-purple-600 hover:underline" >
            <Link to="/Recovery">
              <b>Forget Password?</b>
            </Link>
          </p>
          <div className="mt-4">
            <ReCAPTCHA
              className="my-3 w-full"
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