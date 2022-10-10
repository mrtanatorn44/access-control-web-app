import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import Swal from 'sweetalert2'
import ReCAPTCHA from 'react-google-recaptcha'
import emailjs from '@emailjs/browser';

import * as userModel from "../firebase/userModel"

function Verify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const captchaRef = useRef(null)
  const [ captcha, setCaptcha ] = useState(true)

  useEffect(() => {
    if (searchParams.get('key') === null || searchParams.get('key') === undefined) {
      navigate('/');
    }
  }, [])

  useEffect(() => {
    if (!captcha) {
      if (searchParams.get('key') === null || searchParams.get('key') === undefined) {
        navigate('/');
      } else {
        var verify_hash = searchParams.get('key').toString()
        tryVerify(verify_hash)
      }
    }
  }, [captcha])

  const tryVerify = (verify_hash) => {
    userModel.verifyEmail(verify_hash, verifySuccess, verifyFailed, verifyAlready, verifyExpired)
  }
    const verifySuccess = (email) => {
      Swal.fire({ title: 'Verify success', text:"You account has verified (" + (email) + ').', icon: 'success', confirmButtonText: 'Back' })
    }
    const verifyFailed = (msg) => {
      Swal.fire({ title: 'Verify failed', text: msg, icon: 'error', confirmButtonText: 'Back' })
    }
    const verifyAlready = (email) => {
      Swal.fire({ title: 'Verify failed', text:"You have already verified (" + (email) + ').', icon: 'warning', confirmButtonText: 'Back' })
    }
    const verifyExpired = (obj) => {
      Swal.fire({ title: 'Verify failed', text:"Your verify key has expired (" + (obj.email) + ').', icon: 'warning',
        showCancelButton: true, confirmButtonText: 'Send verify to email', denyButtonText: `Back`, })
        .then((result) => { if (result.isConfirmed) { sendNewVerify(obj.hash) } })
    }
      const sendNewVerify = (oldHash) => {
        userModel.sendVerify(oldHash, sendVerifySuccess, sendVerifyUnsuccess)
      }
        const sendVerifySuccess = async (user) => {
          await sendEmailVerify(user)
          Swal.fire({ title: 'Send link success', text:"We have sent verify link to your email (" + (user.email) + ').', icon: 'success', confirmButtonText: 'Back' })
        }
        const sendVerifyUnsuccess = (msg) => {
          Swal.fire({ title: 'Send link failed', text: msg, icon: 'error', confirmButtonText: 'Back' })
        }

  // Email function
  const sendEmailVerify = (user) => {
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
        Verification
      </h1>
      <form className="mt-6" >
        {captcha &&
        <h1 className="mt-4 font-normal text-center text-gray-700">Please verify CAPTCHA before process.</h1>}
        <ReCAPTCHA
          className="my-3"
          sitekey={process.env.REACT_APP_RECAPTCHA_KEY}
          badge= 'inline'
          ref={captchaRef}
          onChange={() => {setCaptcha(false);}}
        />
        <div className="mt-6">
          <button className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:bg-purple-600">
            Go back to login
          </button >
        </div>
      </form>
    </div>
  </div>
  )
}

export default Verify