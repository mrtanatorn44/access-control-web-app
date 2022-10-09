import { collection, addDoc, getFirestore, getDocs, query, where } from "firebase/firestore"; 
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
      const docRef =  addDoc(collection(db, "Users"), {
        email:          dataUser.email,
        email_verify:   dataUser.email_verify,
        hash_password:  dataUser.hash_password,
        salt_password:  dataUser.salt_password,
        username:       dataUser.username,
        verify_hash:    dataUser.verify_hash,
        verify_time:    dataUser.verify_time
      })
      .then((doc) => {
        console.log("add User success!");
        return success(doc.id)
      })
      .catch((error) => {
        console.error("add User  error ", error);
      });
    }
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}


//อย่าพึ่งลบทำไว้รอ
// userModel.Login(loginForm, LoginSuccess, LoginFailed)
export async function Login(loginForm, loginSuccess, loginFailed, emailNotVerify){
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
            return loginSuccess(user)
          } else {
            return emailNotVerify(user.email)
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

//อย่าพึ่งลบทำไว้รอ
// userModel.Update Password(variableTest, UpdateSuccess, UpdateFailed)
// export const updateAccount = (newpass, success,unsuccess) => {
//   try {

//   } catch (e) {
//     console.error("Login Failed", e);
//   }
// }