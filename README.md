# glitch_3
Freecodecamp API project number 3
Microservice for creating URL shortcuts
User stories:
  I can pass a URL as a parameter and I will receive a shortened URL in the JSON response.
  When I visit that shortened URL, it will redirect me to my original link.
Example creation usage:
  https://https://api-3.glitch.me/new/https://www.google.com
  https://https://api-3.glitch.me/new/http://foo.com:80
Example creation output
  { "original_url":"http://foo.com:80", "short_url":"https://api-3.glitch.me//8170" }
Usage:
  https://https://api-3.glitch.me//2871
Will redirect to:
  https://www.google.com/
