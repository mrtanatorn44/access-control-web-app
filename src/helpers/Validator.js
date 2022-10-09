export function hasBadLength(text) {
  return text.length < 8 || text.length > 30
}

export function hasNoSpecialChar(text) {
  // !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~
  return !text.match(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/)
}

export function hasNoUpperCaseLetter(text) {
  return !text.match(/[A-Z]/)
}

export function hasNoLowerCaseLetter(text) {
  return !text.match(/[a-z]/)
}

export function hasNoNumber(text) {
  return !text.match(/[0-9]/)
}

export function invalidPassword(pw, re_pw) {
  var notValidate = false
  notValidate = (pw !== re_pw)              ? "Your password not match re-password."                        : notValidate 
  notValidate = (hasNoNumber(pw))           ? 'Your password must contain at least one digit.'              : notValidate
  notValidate = (hasNoUpperCaseLetter(pw))  ? 'Your password must contain at least one Upper-case letter.'  : notValidate
  notValidate = (hasNoLowerCaseLetter(pw))  ? 'Your password must contain at least one letter.'             : notValidate
  notValidate = (hasNoSpecialChar(pw))      ? 'Password must contain atleast 1 special-character.'          : notValidate
  notValidate = (hasBadLength(pw))          ? 'Password must has length between 8 and 30.'                  : notValidate
  return notValidate
}

export function invalidUsername(username) {
  var notValidate = false
  notValidate = (hasBadLength(username))  ? 'Username must has length between 8 and 30.' : notValidate
  return notValidate
}

export function invalidEmail(mail) {
  var notValidate = false
  notValidate = mail.length > 100 ? 'You email is invalid length' : notValidate
  notValidate = !(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) ? 'You have entered an invalid email address.' : notValidate
  return notValidate 
}
