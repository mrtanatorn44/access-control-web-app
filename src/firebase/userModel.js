import { collection, addDoc ,getFirestore, getDocs, updateDoc, doc, query, where, deleteDoc, orderBy, deleteField } from "firebase/firestore"; 
import app from "./Connect";
import bcrypt from 'bcryptjs'
const db = getFirestore(app);

export async function addUser(dataUser, success ,unsuccess){
  try {
    const userSnapshot = await getDocs(collection(db, "Users"));
    console.log('Checking duplicate email...');
    var isUsernameOrEmailChoosen = false
    userSnapshot.forEach((user) => {
      if (!isUsernameOrEmailChoosen) {
        if (user.data().email === dataUser.email && user.data().email_verify) {
          console.log('Email choosen')
          isUsernameOrEmailChoosen = true
          return unsuccess('Your email was choosen by other.')
        }
        if (user.data().username === dataUser.username) {
          console.log('Username choosen')
          isUsernameOrEmailChoosen = true
          return unsuccess('Your username was choosen by other.')
        }
      }
    })
    
    console.log('Adding user...');
    if (!isUsernameOrEmailChoosen) {
      const user_data = {
        email:          dataUser.email,
        email_verify:   dataUser.email_verify,
        hash_password:  dataUser.hash_password,
        salt_password:  dataUser.salt_password,
        time_password:  dataUser.time_password,
        username:       dataUser.username,
        verify_hash:    dataUser.verify_hash,
        verify_time:    dataUser.verify_time
      }
      const docRef =  addDoc(collection(db, "Users"), user_data)
      .then((doc) => {
        saveLog('INFO', `Username: ${user_data.username} has registered.`)
        return success(user_data)
      })
      .catch((error) => {
        saveLog('ERROR', `FUNC(addUser) => ${error}`)
        return unsuccess('Error')
      });
    }
  } catch (error) {
    saveLog('ERROR', `FUNC(addUser) => ${error}`)
    return unsuccess('Error')
  }
}

export async function Login(loginForm, loginSuccess, loginFailed, emailNotVerify, expiredPassword, emailNotFound){
  try {
    const userRef = collection(db, "Users");
    const userQuery = query(userRef, where("username", "==", loginForm.username));
    const userSnapshot = await getDocs(userQuery);
    if (userSnapshot.empty) {
      return loginFailed('user not found')
    }
    userSnapshot.forEach((user) => {
      user = user.data()
      // Check username
      if (user.username === loginForm.username) { 
        // Get loginForm password and hash
        var salt_pw = user.salt_password
        var hash_pw = bcrypt.hashSync(loginForm.password, salt_pw);
        // Check password with hash
        if (user.hash_password === hash_pw) {
          if (user.email_verify) {
            // Check password expire
            if (user.time_password.toDate().getTime() < new Date().getTime()) {
              saveLog('INFO', `Username: ${user.username} try to login with expired password.`)
              return expiredPassword(user)
            } 
            // No exception
            else {
              saveLog('INFO', `Username: ${user.username} has logged-in.`)
              return loginSuccess(user)
            }
          } else {
            saveLog('INFO', `Username: ${user.username} try to login with un-verify email.`)
            return emailNotVerify(user)
          }
        } else {
          saveLog('INFO', `Username: ${user.username}  try to login with wrong password.`)
          return loginFailed('wrong password')
        }
      }
    });
  } catch (error) {
    saveLog('ERROR', `FUNC(Login) => ${error}`)
    return loginFailed('Error')
  }
}

export async function sendResetPw(email, sendResetPwSuccess, sendResetPwUnsuccess){
  try {
    const userRef = collection(db, "Users");
    const userQuery = query(userRef, where("email", "==", email));
    const userSnapshot = await getDocs(userQuery);
    if (userSnapshot.empty){
      return sendResetPwUnsuccess('Email was not found.') 
    } else {
      userSnapshot.forEach((user) => {
        const user_ID = user.id
        user = user.data()
        // Check email
        if (user.email === email) { 
          const targetUserRef = doc(db, "Users", user_ID);
          const new_reset_hash = Math.random().toString(36).substring(2)
          console.log(targetUserRef);
          updateDoc(targetUserRef, ({ 
            reset_hash   : new_reset_hash,
            reset_time   : new Date(new Date().getTime() + 30*60000) // add 30 minutes since create acc
          }))
          saveLog('INFO', `Send reset password link to ${user.email} (${user.username}).`)
          user.reset_hash = new_reset_hash;
          return sendResetPwSuccess(user)
        }
      });
    }
  } catch (error) {
    saveLog('ERROR', `FUNC(sendResetPw) => ${error}`)
    return sendResetPwUnsuccess('Error')
  }
}
export async function verifyResetPw(reset_hash, verifySuccess, verifyUnsuccess) {
  try {
    const userRef = collection(db, "Users");
    const userQuery = query(userRef, where("reset_hash", "==", reset_hash));
    const userSnapshot = await getDocs(userQuery);
    if (userSnapshot.empty){
      return verifyUnsuccess('Verify key was not found.')
    } else {
      userSnapshot.forEach((user) => {
        const user_ID = user.id
        user = user.data()
        // Check hash verify
        if (user.reset_hash === reset_hash) { 
          if (user.reset_time.toDate().getTime() < new Date().getTime()) {
            saveLog('INFO', `Username: ${user.username} reset link expired.`)
            return verifyUnsuccess("Reset link expired.")
          } else {
            saveLog('INFO', `Username: ${user.username} reset link granted.`)
            return verifySuccess(user)
          }
        }
      });
    }
  } catch (error) {
    saveLog('ERROR', `FUNC(verifyResetPw) => ${error}`)
    return verifyUnsuccess('Error')
  }
}

export async function updatePassword(userData,password, updateSuccess, updateUnsuccess) {
  try {
    const q = query(collection(db, "Users"), where("username", "==", userData.username));
    const querySnapshot = await getDocs(q);
    if(querySnapshot.empty){
      return updateUnsuccess("Username")
    }
    else{
      querySnapshot.forEach((user) => {
        const user_ID = user.id
        user = user.data()
        var salt_pw = user.salt_password
        var hash_pw = bcrypt.hashSync(password, salt_pw);
        console.log(user.hash_password);
        console.log(hash_pw);
        const targetUserRef = doc(db, "Users", user_ID);
        if(user.hash_password !== hash_pw){
          updateDoc(targetUserRef, ({ 
            hash_password : userData.hash_password,
            salt_password : userData.salt_password,
            time_password : new Date(new Date().getTime() + (90 * 24 * 60 * 60 * 1000)), // add 90 day since now
            reset_hash    : '',
            reset_time    : ''
          }))
          saveLog('INFO', `Username:${user.username} has update password.`)
          return updateSuccess()
        }else{
          saveLog('INFO', `Username:${user.username} update password not success, password same as old password.`)
          return updateUnsuccess()
        }
      });
    }
  } catch (error) {
    saveLog('ERROR', `FUNC(updatePassword) => ${error}`)
    return updateUnsuccess('Error')
  }
}

export async function verifyEmail(hash, verifySuccess, verifyUnsuccess, verifyAlready, verifyExpired) {
  try {
    const userRef = collection(db, "Users");
    const userQuery = query(userRef, where("verify_hash", "==", hash));
    const userSnapshot = await getDocs(userQuery);
    if (userSnapshot.empty){
      return verifyUnsuccess('Verify key was not found.')
    } else {
      userSnapshot.forEach((user) => {
        const user_ID = user.id
        user = user.data()
        // Check hash verify
        if (user.verify_hash === hash) { 
          if (user.email_verify) {
            saveLog('WARNING', `Username:${user.username} has already verify email but link still access.`)
            return verifyAlready(user.email)
          } else if (user.verify_time.toDate().getTime() < new Date().getTime()) {
            saveLog('INFO', `Username:${user.username} has expired password.`)
            return verifyExpired({ email: user.email, hash: hash})
          } else {
            const  targetUserRef = doc(db, "Users", user_ID);
            updateDoc(targetUserRef, ({ 
              email_verify  : true ,
              verify_hash   : deleteField(),
              verify_time   : deleteField()
            }))
            deleteTargetEmail(user.email)
            saveLog('INFO', `Username:${user.username} has succes verified email.`)
            return verifySuccess(user.email)
          }
        }
      });
    }
  } catch (error) {
    saveLog('ERROR', `FUNC(verifyEmail) => ${error}`)
    return verifyUnsuccess('error')
  }
}

export async function deleteTargetEmail(email) {
  try {
    const userRef = collection(db, "Users");
    const userQuery = query(userRef, where("email", "==", email));
    const userSnapshot = await getDocs(userQuery);
    if (userSnapshot.empty){
      // return verifyUnsuccess('Verify key was not found.')
    } else {
      userSnapshot.forEach((user) => {
        const user_ID = user.id
        user = user.data()
        // Check hash verify
        if (user.email === email && !user.email_verify) { 
          const  targetUserRef = doc(db, "Users", user_ID);
          deleteDoc(targetUserRef)
            .then(() => {
              // console.log("User with email " + email + ' has delete docs')
              saveLog('INFO', `Delete doc in 'Users' by username:${user.username}, email:${email}`)
            })
            .catch(error => {
              console.log(error);
              saveLog('ERROR', `FUNC(deleteTargetEmail) => ${error}`)
            })
          // return verifySuccess(user.email)
        }
      });
    }
  } catch (error) {
    saveLog('ERROR', `FUNC(deleteTargetEmail) => ${error}`)
    // return verifyUnsuccess('error')
  }
}

// export async function updateEmailByUsername(dataUser, success) {
//   try {
//     const userRef = collection(db, "Users");
//     const userQuery = query(userRef, where("username", "==", dataUser.username));
//     const userSnapshot = await getDocs(userQuery);
//     if (userSnapshot.empty){
//       // return repeatUnsuccess('Update email error.')
//     } else {
//       userSnapshot.forEach((user) => {
//         const user_ID = user.id
//         user = user.data()
//         // Check hash verify
//           const targetUserRef = doc(db, "Users", user_ID);
//           updateDoc(targetUserRef, { email: dataUser.email })
//           return success()
//       });
//     }
//   } catch (error) {
//     console.error("updateEmailByUsername : ", error);
//     // return verifyUnsuccess('error')
//   }
// }

export async function sendVerify(hash, repeatSuccess, repeatUnsuccess) {
  try {
    const userRef = collection(db, "Users");
    const userQuery = query(userRef, where("verify_hash", "==", hash));
    const userSnapshot = await getDocs(userQuery);
    if (userSnapshot.empty){
      return repeatUnsuccess('Verify key was not found.')
    } else {
      userSnapshot.forEach((user) => {
        const user_ID = user.id
        user = user.data()
        // Check hash verify
        if (user.verify_hash === hash) { 
          const targetUserRef = doc(db, "Users", user_ID);
          const new_verify_hash = Math.random().toString(36).substring(2)
          updateDoc(targetUserRef, ({ 
            verify_hash   : new_verify_hash,
            verify_time   : new Date(new Date().getTime() + 30*60000) // add 30 minutes since create acc
          }))
          saveLog('INFO', `Send verify to username:${user.username}, email${user.email}`)
          user.verify_hash = new_verify_hash;
          return repeatSuccess(user)
        }
      });
    }
  } catch (error) {
    saveLog('ERROR', `FUNC(sendVerify) => ${error}`)
    return repeatUnsuccess('Error')
  }
}

export async function readLog(success) {
  try {
    const logRef = collection(db, "Logs");
    const logQuery = query(logRef, orderBy("timestamp", "desc"));
    const logSnapshot = await getDocs(logQuery);
    var log_array = []
    logSnapshot.forEach(log => {
      log_array.push(log.data())
    })
    return success(log_array)

  } catch (error) {
  
  }
}
export async function saveLog(type, text) {
  try {
    await addDoc(collection(db, "Logs"), {
      type      : type,
      text      : text,
      timestamp : new Date(new Date().toLocaleString('en', {timeZone: 'Asia/Bangkok'}))
    })
      .then((doc) => {
        // console.log("");
      })
      .catch((error) => {
        console.error("error");
      });
  } catch (error) {
    console.log("add log error");
  }
}