const patternDict = [{
  pattern: '\\b(?<greeting>Hi|Hello|Hey)\\b',
  intent: 'Hello'
},
{
  pattern: '\\b(bye|exit)\\b',
  intent: 'Exit'
},
{
  pattern: '\\b(weather)\\s(like\\s)?in\\s\\b(?<city>[A-Za-z]+([A-Za-z]+)?)\\s\\b(?<time>tomorrow|today)',
  intent: 'get weather'
},
{
  pattern: '\\b(weather)\\s?in\\s\\b(?<city>[A-Za-z]+([A-Za-z]+)?)',
  intent: 'Current Weather'
}
]
// ^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$

module.exports = patternDict
//([A-Za-z]+?[A-Za-z])