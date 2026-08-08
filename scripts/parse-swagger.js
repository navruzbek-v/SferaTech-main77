const fs = require('fs')
const j = JSON.parse(fs.readFileSync('C:/Users/user/.cursor/projects/d-SferaTech-main77/agent-tools/d1351728-13e2-4c91-b8ec-8fe3f41678b3.txt', 'utf8'))

const paths = [
  '/auth/loginwithtelegram', '/auth/login', '/auth/refresh',
  '/users/getprofile', '/users/getstats', '/users/updateprofile',
  '/question/getlist', '/question/getrandom', '/question/create', '/question/update', '/question/delete',
  '/exam/start', '/exam/{attemptId}', '/exam/{attemptId}/answer', '/exam/{attemptId}/complete', '/exam/{attemptId}/result',
  '/user/getusers', '/user/updateuser', '/user/banuser', '/user/unbanuser',
  '/examresult/getlist', '/examresult/getbyid', '/examresult/approve', '/examresult/reject', '/examresult/startreview',
  '/examdates/getlist', '/examdates/getmyselection', '/examdates/select',
  '/systemsettings/getall', '/systemsettings/update',
  '/analytics/getdashboard', '/analytics/getdifficultquestions',
  '/docximport/upload', '/docximport/preview', '/docximport/import',
  '/tests/start', '/tests/getsession', '/tests/submitanswer', '/tests/complete', '/tests/gethistory',
  '/mistakes/getlist', '/leaderboard/getglobal',
  '/audios/getlist', '/audios/upload',
  '/notifications/getlist',
  '/cefrcontent/getblueprint', '/cefrcontent/getskills', '/cefrcontent/getinventory',
  '/writing/submit', '/speaking/submitaudio',
  '/exportbackup/export', '/reports/generateadminreport',
  '/monitoring/getauditlogs', '/system/getstatus',
  '/pvp/joinqueue', '/pvp/getmatchstatus',
]

function resolve(ref) {
  if (!ref || !ref.startsWith('#/')) return ref
  const parts = ref.replace('#/', '').split('/')
  let cur = j
  for (const p of parts) cur = cur?.[p]
  return cur
}

function showSchema(sch, depth = 0) {
  if (!sch) return null
  if (sch.$ref) {
    const name = sch.$ref.split('/').pop()
    const resolved = resolve(sch.$ref)
    if (depth > 1) return { $ref: name }
    return { $ref: name, ...(resolved ? { props: showSchema(resolved, depth + 1) } : {}) }
  }
  if (sch.type === 'object' || sch.properties) {
    const props = {}
    for (const [k, v] of Object.entries(sch.properties || {})) {
      if (v.$ref) props[k] = v.$ref.split('/').pop()
      else if (v.type === 'array') props[k] = 'array<' + (v.items?.$ref?.split('/').pop() || v.items?.type || '?') + '>'
      else props[k] = v.type || (v.enum ? 'enum:' + v.enum.join('|') : JSON.stringify(v).slice(0, 80))
    }
    return { required: sch.required, props }
  }
  return sch
}

for (const p of paths) {
  const op = j.paths[p]
  if (!op) { console.log('\nMISSING', p); continue }
  console.log('\n====', p, '====')
  for (const [m, o] of Object.entries(op)) {
    if (!['get', 'post', 'put', 'patch', 'delete'].includes(m)) continue
    console.log(m.toUpperCase(), o.summary || '')
    if (o.parameters?.length) {
      console.log(' params:', o.parameters.map(x => `${x.in}:${x.name}${x.required ? '*' : ''}`).join(', '))
    }
    const body = o.requestBody?.content?.['application/json']?.schema
      || o.requestBody?.content?.['multipart/form-data']?.schema
    if (body) console.log(' body:', JSON.stringify(showSchema(body), null, 0))
    const resp = o.responses?.['200']?.content?.['application/json']?.schema
    if (resp) console.log(' resp:', JSON.stringify(showSchema(resp), null, 0))
  }
}

const schemas = j.components?.schemas || {}
const want = Object.keys(schemas).filter(k =>
  /LoginTelegram|LoginRequest|LoginResponse|Auth|TokenResponse|QuestionDto|QuestionList|CreateQuestion|UserDto|UserList|Profile|ExamStart|Attempt|AnswerRequest|Cefr|SystemSetting|ExamDate|ExamResult/i.test(k)
)
console.log('\n## KEY SCHEMAS')
for (const name of want) {
  console.log('\n###', name)
  console.log(JSON.stringify(showSchema(schemas[name]), null, 2).slice(0, 1200))
}
