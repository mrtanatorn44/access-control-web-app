import React, { useState } from "react";
import { Link } from "react-router-dom";
import Swal from 'sweetalert2'
function Recovery() {
 const [email_Recovery,setemail_Recovery] = useState("")
 
//  const doRequestPasswordReset = async function () {
//   // Note that this value come from state variables linked to your text input
//   const emailValue = email;
//   try {
//     await Parse.User.requestPasswordReset(emailValue);
//     alert(`Success! Please check ${email} to proceed with password reset.`);
//     return true;
//   } catch(error) {
//     // Error can be caused by lack of Internet connection
//     alert(`Error! ${error}`);
//     return false;
//   }
// };

 function ResetPassword(event) {
    event.preventDefault();
    console.log(email_Recovery);
    Swal.fire('Email Sent Successfully')
  }
  return (
    <div className="relative flex flex-col justify-center min-h-screen overflow-hidden bg-purple-900">
      <div className="w-full p-6 m-auto bg-white rounded-md shadow-md lg:max-w-xl">
        <h1 className="text-3xl font-semibold text-center text-purple-700 underline">
            Forgot Your Password?
        </h1>
        <form className="mt-6" onSubmit={(e) => ResetPassword(e)}>
          <div className="mb-2">
            <label htmlFor="Email" className="block text-sm font-semibold text-gray-800">
              Email
            </label>
            <input
              type="Email"
              className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
              onChange={e => setemail_Recovery(e.target.value)}
              required
            />
          </div>
          <div className="mt-6">
            <button className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:bg-purple-600">
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