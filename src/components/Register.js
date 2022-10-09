import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import emailjs from '@emailjs/browser';
import bcrypt from 'bcryptjs'
import Swal from 'sweetalert2'
import ReCAPTCHA from 'react-google-recaptcha'

import * as userModel from "../firebase/userModel"
import * as Validator from '../helpers/Validator'

function Register() {
  const navigate = useNavigate();
  const captchaRef = useRef(null)
  const [ captcha, setCaptcha ] = useState(true)

  const [showPassword, setShowPassword ] = useState(false)
  const [registerForm,setRegisterForm] = useState({
    username:'',
    email:'',
    password: '',
    confirm_password: '',
  })

  function SubmitRegister(event) {
    event.preventDefault();
    const token = captchaRef.current.getValue();
    captchaRef.current.reset();

    var isInvalidForm = false;
    if (isInvalidForm = Validator.invalidUsername(registerForm.username))
      isInvalidForm = Validator.invalidUsername(registerForm.username)
    if (Validator.invalidPassword(registerForm.password, registerForm.confirm_password))
      isInvalidForm = Validator.invalidPassword(registerForm.password, registerForm.confirm_password)
    if (Validator.invalidEmail(registerForm.email))
      isInvalidForm = Validator.invalidEmail(registerForm.email) 

    if (!isInvalidForm) {
      var salt_pw = bcrypt.genSaltSync(10);
      var hash_pw = bcrypt.hashSync(registerForm.password, salt_pw);
      var user_form = {
        username      : registerForm.username,
        email         : registerForm.email,
        hash_password : hash_pw,
        salt_password : salt_pw,
        time_password : new Date(new Date().getTime() + (90 * 24 * 60 * 60 * 1000)), // add 90 day since now
        email_verify  : false,
        verify        : false,
        verify_hash   : Math.random().toString(36).substring(2),
        verify_time   : new Date(new Date().getTime() + (30*60000)) // add 30 minutes since create acc
      }
      // console.log(user_form)
      userModel.addUser(user_form, registerSuccess, registerFailed)
    } else {
      Swal.fire({ title: 'Register', text: isInvalidForm, icon: 'error', confirmButtonText: 'ok' })
    }
  }

  const registerSuccess = (user) => {
    Swal.fire({ title: 'Register Success', text: 'Please verify your email ' + user.email, icon: 'success', confirmButtonText: 'Sign up' })
    .then(async ()=>{
      await sendEmailVerify(user)
      navigate("/")
    })
  }

  const registerFailed = (msg) => {
    Swal.fire({ title: 'Register Failed', text: msg, icon: 'error', confirmButtonText: 'Cool' })
  }

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
        console.log(result.text);
      }, (error) => {
        console.log(error.text);
      });
  };

  return (
    <div className="relative flex flex-col justify-center min-h-screen overflow-hidden bg-purple-900">
      <div className="w-full p-6 m-auto bg-white rounded-md shadow-md lg:max-w-xl">
        <h1 className="text-3xl font-semibold text-center text-purple-700 underline">
          Register
        </h1>
        <form className="mt-6" onSubmit={(e) => SubmitRegister(e)}>
          <div className="mb-2">
            <label htmlFor="Username" className="block text-sm font-semibold text-gray-800">
              Username 
            </label>
            <input
              placeholder='Username'
              type="username"
              className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
              onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
              required
            />
            <label className="text-sm text-red-800">{Validator.invalidUsername(registerForm.username)}</label>
          </div>
          <div className="mb-2">
            <label htmlFor="Email" className="block text-sm font-semibold text-gray-800">
              Email
            </label>
            <input
              placeholder='Email'
              type="Email"
              className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              required
            />
            {/* <label className="text-sm text-red-800">{Validator.invalidEmail(registerForm.email)}</label> */}
          </div>
          <div className="mb-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-800"
            >
              Password
            </label>
            <input
              placeholder='Password'
              type={ showPassword ? "text" : "password" }
              className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              required
            />
            <label className="text-sm text-red-800">{Validator.invalidPassword(registerForm.password, registerForm.confirm_password)}</label>
          </div>
          <div className="mb-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-800"
            >
              Re-Password
            </label>
            <input
              placeholder='Comfirm password'
              type={ showPassword ? "text" : "password" }
              className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
              onChange={(e) => setRegisterForm({ ...registerForm, confirm_password: e.target.value })}
              required
            />
            <label className="text-sm text-red-800">{Validator.invalidPassword(registerForm.password, registerForm.confirm_password)}</label>
          </div>
          <input
            id="checkboxShowPassword"
            type="checkbox"
            onChange={() => setShowPassword(!showPassword)}
          />
          <label htmlFor="checkboxShowPassword">
            {" "}Show password
          </label>

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
              Register
            </button >
          </div>
          <p className="mt-4 text-xs font-light text-center text-gray-700">
          {" "}Have an account?{" "}
          <Link to="/Login">
            <b className="mt-4 text-xs font-bold text-center text-gray-700  underline ">Login</b>
          </Link>
        </p>
        </form>
      </div>
    </div>
  )
}

export default Register