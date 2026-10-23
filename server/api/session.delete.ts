export default defineEventHandler((event) => {
  clearSessionCookie(event)
  setResponseStatus(event, 204)
  return null
})
