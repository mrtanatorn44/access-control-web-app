import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from "react-router-dom";

import Swal from 'sweetalert2'
import bcrypt, { hash } from 'bcryptjs'
import ReCAPTCHA from 'react-google-recaptcha'

import * as userModel from "../firebase/userModel"
import * as Validator from '../helpers/Validator'
import { async } from '@firebase/util';

function Reset(event) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const captchaRef = useRef(null)
  const [ captcha, setCaptcha ] = useState(true)

  const [ passwordForm, setPasswordForm ] = useState({ password : '', repassword : '' })
  const [ showPassword, setShowPassword ] = useState(false)
  const [ userData, setUserData ] = useState(null)

  useEffect(() => {
    if (searchParams.get('key') === null || searchParams.get('key') === undefined) {
      navigate('/');
    } else {
      var reset_hash = searchParams.get('key').toString()
      checkResetLink(reset_hash)
    }
  }, [])

  const checkResetLink = (reset_hash) => {
    userModel.verifyResetLink(reset_hash, verifyResetSuccess, verifyResetUnsuccess)
  }
  const verifyResetSuccess = (user) => {
    setUserData(user)
  }
  const verifyResetUnsuccess = (msg) => {
    Swal.fire({ title: 'Reset link failed', text: msg, icon: 'error', confirmButtonText: 'Back' })
      .then(async ()=>{ navigate("/") })
  }
  
  function onResetPassword(event) {
    event.preventDefault();
    captchaRef.current.reset();

    // Check password format
    var isInvalidForm = false;
    if (Validator.invalidPassword(passwordForm.password, passwordForm.repassword))
      isInvalidForm = Validator.invalidPassword(passwordForm.password, passwordForm.repassword)

    if (!isInvalidForm) {
      // console.log(passwordForm)
      var user = userData
      // hash new password
      var salt_pw = bcrypt.genSaltSync(10)
      var hash_pw = bcrypt.hashSync(passwordForm.password, salt_pw)
      // console.log(' ', salt_pw, '\n', hash_pw)
      // define new password
      user.salt_password = salt_pw
      user.hash_password = hash_pw
      // console.log("Password hash", user);
      userModel.updatePassword(user, updateSuccess, updateUnsuccess)
    } else {
      Swal.fire({ title: 'Register', text: isInvalidForm, icon: 'error', confirmButtonText: 'ok' })
    }
  }
  const updateSuccess = () => {
    Swal.fire({ title: 'Reset Password Successfully', icon: 'success', confirmButtonText: 'Back to login' })
      .then(async ()=>{ navigate("/") })
  }
  const updateUnsuccess = (msg) => {
    Swal.fire({ title: 'Reset Password Failed', text: msg, icon: 'error', confirmButtonText: 'Back to login' })
  }

  return (
    <div className="relative flex flex-col justify-center min-h-screen overflow-hidden bg-purple-900">
      <div className="w-full p-6 m-auto bg-white rounded-md shadow-md lg:max-w-xl">
        <h1 className="text-3xl font-semibold text-center text-purple-700 underline">
        Reset Password
        </h1>
        <form className="mt-6" onSubmit={(e) => onResetPassword(e)}>
          <div className="mb-2">
            <label htmlFor="Password" className="block text-sm font-semibold text-gray-800">
              New Password
            </label>
            <input
              placeholder='New Password'
              type={ showPassword ? "text" : "password" }
              className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
              required
              onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
            />
          </div>
          <div className="mb-2">
            <label htmlFor="Password" className="block text-sm font-semibold text-gray-800">
              Confirm New Password
            </label>
            <input
              placeholder='Confirm New Password'
              type={ showPassword ? "text" : "password" }
              className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
              required
              onChange={(e) => setPasswordForm({ ...passwordForm, repassword: e.target.value })}
            />
          </div>
          <div className="mt-2">
            <input
              id="checkboxShowPassword"
              type="checkbox"
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="checkboxShowPassword">
              {" "}Show password
            </label>
          </div>
          <div className="mt-2">
            <ReCAPTCHA
              className="my-3"
              sitekey={process.env.REACT_APP_RECAPTCHA_KEY}
              badge= 'inline'
              ref={captchaRef}
              onChange={() => {setCaptcha(false);}}
            />
            <button 
              disabled={captcha}
              type="submit" 
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
      </div>
    </div>
  )
}

export default Reset