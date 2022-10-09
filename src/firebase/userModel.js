import { collection, addDoc ,getFirestore, getDocs, updateDoc, doc, query, where } from "firebase/firestore"; 
import { getDatabase, ref, set } from "firebase/database";
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
        if (user.data().email == dataUser.email && user.data().email_verify) {
          console.log('Email choosen')
          isUsernameOrEmailChoosen = true
          return unsuccess('Your email was choosen by other.')
        }
        if (user.data().username == dataUser.username) {
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
        console.log("add User success!");
        return success(user_data)
      })
      .catch((error) => {
        console.error("add User  error ", error);
      });
    }
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export async function Login(loginForm, loginSuccess, loginFailed, emailNotVerify, expiredPassword){
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
      if (user.username == loginForm.username) { 
        // Get loginForm password and hash
        var salt_pw = user.salt_password
        var hash_pw = bcrypt.hashSync(loginForm.password, salt_pw);
        // Check password with hash
        if (user.hash_password == hash_pw) {
          if (user.email_verify) {
            // Check password expire
            if (user.time_password.toDate().getTime() < new Date().getTime()) {
              return expiredPassword(user)
            } else {
              return loginSuccess(user)
            }
          } else {
            return emailNotVerify(user)
          }
        } else {
          return loginFailed('wrong password')
        }
      }
    });
  } catch (e) {
    console.error("Login Failed", e);
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
          updateDoc(targetUserRef, ({ 
            reset_hash   : new_reset_hash,
            reset_time   : new Date(new Date().getTime() + 30*60000) // add 30 minutes since create acc
          }))
          user.reset_hash = new_reset_hash;
          return sendResetPwSuccess(user)
        }
      });
    }
  } catch (error) {
    console.error("sendForgetPassword : ", error);
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
        if (user.reset_hash == reset_hash) { 
          if (user.reset_time.toDate().getTime() < new Date().getTime()) {
            return verifyUnsuccess("Reset link expired.")
          } else {
            return verifySuccess(user)
          }
        }
      });
    }
  } catch (error) {
    console.error("verifyEmail : ", error);
    return verifyUnsuccess('Error')
  }
}

export async function updatePassword(userData, updateSuccess, updateUnsuccess) {
  try {
    const getDB = getDatabase();
    const q = query(collection(db, "Users"), where("username", "==", userData.username));
    const querySnapshot = await getDocs(q);
    if(querySnapshot.empty){
      return updateUnsuccess("Username")
    }
    else{
      querySnapshot.forEach((user) => {
        const user_ID = user.id
        user = user.data()

        const targetUserRef = doc(db, "Users", user_ID);
        updateDoc(targetUserRef, ({ 
          hash_password : userData.hash_password,
          salt_password : userData.salt_password,
          time_password : new Date(new Date().getTime() + (90 * 24 * 60 * 60 * 1000)), // add 90 day since now
          reset_hash    : '',
          reset_time    : ''
        }))
          
        return updateSuccess()
      });
    }
  } catch (error) {
    console.error(error)
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
        if (user.verify_hash == hash) { 
          if (user.email_verify) {
            return verifyAlready(user.email)
          } else if (user.verify_time.toDate().getTime() < new Date().getTime()) {
            return verifyExpired({ email: user.email, hash: hash})
          } else {
            const targetUserRef = doc(db, "Users", user_ID);
            updateDoc(targetUserRef, ({ email_verify: true }))
            return verifySuccess(user.email)
          }
        }
      });
    }
  } catch (error) {
    console.error("verifyEmail : ", error);
    return verifyUnsuccess('error')
  }
}
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
        if (user.verify_hash == hash) { 
          const targetUserRef = doc(db, "Users", user_ID);
          const new_verify_hash = Math.random().toString(36).substring(2)
          updateDoc(targetUserRef, ({ 
            verify_hash   : new_verify_hash,
            verify_time   : new Date(new Date().getTime() + 30*60000) // add 30 minutes since create acc
          }))
          user.verify_hash = new_verify_hash;
          return repeatSuccess(user)
        }
      });
    }
  } catch (error) {
    console.error("verifyEmail : ", error);
    return repeatUnsuccess('Error')
  }
}