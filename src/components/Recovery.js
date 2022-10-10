import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2'
import * as userModel from "../firebase/userModel"

import ReCAPTCHA from 'react-google-recaptcha'
import emailjs from '@emailjs/browser';

function Recovery() {
  const navigate = useNavigate();
  const captchaRef = useRef(null)
  const [ captcha, setCaptcha ] = useState(true)
  const [ emailRecovery, setEmailRecovery ] = useState("")

  const onSubmitRecovery = (event) => {
    event.preventDefault();
    captchaRef.current.reset();
    userModel.sendResetPw(emailRecovery, sendResetPwSuccess, sendResetPwUnsuccess)
  }
    const sendResetPwSuccess = async (user) => {
      await sendResetVerify(user)
    }
    const sendResetPwUnsuccess = (msg) => {
      Swal.fire({ title: 'Send link failed', text: msg, icon: 'error', confirmButtonText: 'Back' })
    }
  
  // Email function
  const sendResetVerify = (user) => {
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
        Swal.fire({ title: 'Send link success', text:"We have sent reset password link to your email (" + (user.email) + ').', icon: 'success', confirmButtonText: 'Back' })
          .then(() => { navigate('/') });
        // console.log(result.text);
      }, (error) => {
        // console.log(error.text);
        Swal.fire({ title: 'Send link failed', text: 'Error', icon: 'error', confirmButtonText: 'Back' })
      });
  };
  
  return (
    <div className="relative flex flex-col justify-center min-h-screen overflow-hidden bg-purple-900">
      <div className="w-full p-6 m-auto bg-white rounded-md shadow-md lg:max-w-xl">
        <h1 className="text-3xl font-semibold text-center text-purple-700 underline">
            Forgot Your Password?
        </h1>
        <form className="mt-6" onSubmit={(e) => onSubmitRecovery(e)}>
          <div className="mb-2">
            <label htmlFor="Email" className="block text-sm font-semibold text-gray-800">
              Email
            </label>
            <input
              type="Email"
              className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
              onChange={e => setEmailRecovery(e.target.value)}
              required
            />
          </div>
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
              Reset Password
            </button >
          </div>
        </form>
        <p className="mt-4 text-xs font-light text-center text-gray-700">
          {" "}Don't have an account?{" "}
          <Link to="/Register">
            <b className="mt-4 text-xs font-bold text-center text-gray-700  underline ">Create Account</b>
          </Link>
        </p>
        <p className="mt-4 text-xs font-light text-center text-gray-700">
          {" "}Have an account?{" "}
          <Link to="/Login">
            <b className="mt-4 text-xs font-bold text-center text-gray-700  underline ">Login</b>
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Recovery