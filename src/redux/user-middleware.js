import { loginSuccess, loginError } from './user'
import runMiddlewareOnce from './utils/runMiddlewareOnce'
import { getParams } from '../utils/analytics/source/urlParams'
import { setItemSync } from '../utils/storage'
import { getXsrfToken } from '../utils/auth/xsrfToken'
import lockInstance from '../utils/auth'

const authMiddleware = runMiddlewareOnce((dispatch) => { // eslint-disable-line
  if (typeof window === 'undefined') {
    return false
  }
  if (process.env.NODE_ENV === 'development') {
    console.log('authListener middleware added') // eslint-disable-line
  }
  // register lock callback once
  lockInstance.on('authenticated', (authResult) => { // eslint-disable-line
    if (process.env.NODE_ENV === 'development') {
      console.log('authResult', authResult) // eslint-disable-line
    }
    // Check xrsf token
    const stateValues = getParams(`http://dummy.com?${authResult.state}`)
    // if (!authResult.idTokenPayload.email_verified) {
    //   dispatch(loginError('email-not-verified'))
    //   return false
    // }
    // console.log('authResult', authResult)
    const xsrfToken = getXsrfToken() // eslint-disable-line
    // console.log(xsrfToken)
    if (authResult.idToken && stateValues.token === getXsrfToken()) {
      // console.log('set item sync')
      setItemSync('id_token', authResult.idToken)
      // return { authenticated: true }
    } else {
      dispatch(loginError('invalid-token'))
      alert('Error your authentication token is wrong. Try logging in again') // eslint-disable-line
      handleAuthRedirect(stateValues.url)
      return false
    }
    // Async loads the user profile data
    lockInstance.getProfile(authResult.idToken, (error, profile) => { // eslint-disable-line
      if (error) {
        console.log('Error loading the Profile', error) // eslint-disable-line
        return dispatch(loginError(error))
      }
      if (process.env.NODE_ENV === 'development') {
        console.log('profile', profile) // eslint-disable-line
      }
      // send event to GA
      if (typeof ga !== 'undefined' && process.env.NODE_ENV === 'production') {
        console.log('Event triggered') // eslint-disable-line
        ga('send', { // eslint-disable-line
          hitType: 'event',
          eventCategory: 'user',
          eventAction: 'sign_up',
          eventLabel: 'Beta Signup'
        })
      }
      // set tokens
      setItemSync('profile', profile)
      dispatch(loginSuccess(profile))

      if (profile && profile.user_metadata && profile.user_metadata.hasNextAccess) {
        window.location.href = 'https://next.serverless.com'
        return false
      }
      // redirect
      handleAuthRedirect(stateValues.url)
    })
  })
})

function handleAuthRedirect(url) {
  const redirect = new CustomEvent('routerRedirect', { // eslint-disable-line
    detail: {
      url,
    },
    bubbles: false,
    cancelable: false
  })
  window.dispatchEvent(redirect)
}

export default authMiddleware
